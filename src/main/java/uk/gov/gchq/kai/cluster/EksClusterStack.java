package uk.gov.gchq.kai.cluster;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.core.StackProps;
import software.amazon.awscdk.services.ec2.ISubnet;
import software.amazon.awscdk.services.ec2.IVpc;
import software.amazon.awscdk.services.ec2.Subnet;
import software.amazon.awscdk.services.ec2.SubnetAttributes;
import software.amazon.awscdk.services.ec2.SubnetSelection;
import software.amazon.awscdk.services.ec2.Vpc;
import software.amazon.awscdk.services.ec2.VpcLookupOptions;
import software.amazon.awscdk.services.eks.Cluster;
import software.amazon.awscdk.services.eks.ClusterProps;
import software.amazon.awscdk.services.eks.HelmChartOptions;
import software.amazon.awscdk.services.iam.AccountRootPrincipal;
import software.amazon.awscdk.services.iam.IManagedPolicy;
import software.amazon.awscdk.services.iam.IRole;
import software.amazon.awscdk.services.iam.ManagedPolicy;
import software.amazon.awscdk.services.iam.Role;
import software.amazon.awscdk.services.iam.RoleProps;
import software.amazon.awscdk.services.iam.ServicePrincipal;
import software.amazon.awssdk.services.ec2.Ec2Client;
import software.amazon.awssdk.services.ec2.model.DescribeSubnetsRequest;
import software.amazon.awssdk.services.ec2.model.DescribeSubnetsResponse;
import software.amazon.awssdk.services.ec2.model.DescribeVpcsRequest;
import software.amazon.awssdk.services.ec2.model.DescribeVpcsResponse;
import software.amazon.awssdk.services.ec2.model.Filter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class EksClusterStack extends Stack {
    private static final Logger LOGGER = LoggerFactory.getLogger(EksClusterStack.class);
    public static final String DEFAULT_VPC = "DEFAULT";
    public static final String CLUSTER_NAME = "Kai";

    public EksClusterStack(@NotNull Construct scope, @NotNull String id) {
        this(scope, id, null);
    }

    public EksClusterStack(@NotNull Construct scope, @NotNull String id, @Nullable StackProps props) {
        this(scope, id, props, DEFAULT_VPC);
    }

    public EksClusterStack(@NotNull Construct scope, @NotNull String id, @Nullable StackProps props, @Nullable String vpcId) {
        super(scope, id, props);

        // Basic Cluster Properties
        ClusterProps.Builder clusterPropertiesBuilder = ClusterProps.builder()
                .clusterName(CLUSTER_NAME)
                .kubectlEnabled(true);

        // Vpc
        Ec2Client client = Ec2Client.create();

        String vpc = vpcId;
        List<SubnetSelection> subnets = null;

        if (DEFAULT_VPC.equals(vpc)) {
            vpc = getDefaultVpc(client);
            LOGGER.debug("Using Default VPC: " + vpc);
        }

        IVpc clusterVpc = Vpc.fromLookup(this, CLUSTER_NAME + "Vpc", VpcLookupOptions.builder()
                .vpcId(vpc)
                .build());

        if (vpc != null) {
            subnets = getSubnetsFromVpc(vpc, client);
            clusterPropertiesBuilder.vpc(clusterVpc).vpcSubnets(subnets);
        }

        // Roles
        List<IManagedPolicy> eksManagedPolicies = Arrays.asList(
                ManagedPolicy.fromManagedPolicyArn(this, "ServicePolicy", "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"),
                ManagedPolicy.fromManagedPolicyArn(this, "ClusterPolicy", "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy")
        );

        IRole eksRole = new Role(this, "EksServiceRole", RoleProps.builder()
                .assumedBy(new ServicePrincipal("eks.amazonaws.com"))
                .managedPolicies(eksManagedPolicies)
                .build());


        Role eksClusterAdminRole = new Role(this, "EksClusterAdminRole", RoleProps.builder()
                .assumedBy(new AccountRootPrincipal())
                .build());

        clusterPropertiesBuilder
                .role(eksRole)
                .mastersRole(eksClusterAdminRole);

        // Create the cluster

        Cluster eksCluster = new Cluster(this, CLUSTER_NAME + "EksCluster", clusterPropertiesBuilder.build());

        // Add ingress

        Map<String, Object> ingressValues = new HashMap<>();
        ingressValues.put("clusterName", CLUSTER_NAME);
        ingressValues.put("autoDiscoverAwsRegion", true);
        ingressValues.put("autoDiscoverAwsVpcId", true);

        eksCluster.addChart("AlbIngressChart", HelmChartOptions.builder()
                .chart("aws-alb-ingress-controller")
                .repository("http://storage.googleapis.com/kubernetes-charts-incubator")
                .release("alb-ingress")
                .values(ingressValues)
                .namespace("kube-system")
                .build());

        // Add HDFS - just for test purposes

        /*
         * ingress:
         *   annotations:
         *     kubernetes.io/ingress.class: alb
         *     alb.ingress.kubernetes.io/target-type: ip
         *     alb.ingress.kubernetes.io/scheme: internet-facing
         *   pathPrefix: /*
         *
         */
        Map<String, Object> annotations = new HashMap<>();
        annotations.put("kubernetes.io/ingress.class", "alb");
        annotations.put("alb.ingress.kubernetes.io/target-type", "ip");
        annotations.put("alb.ingress.kubernetes.io/scheme", "internet-facing");

        Map<String, Object> hdfsIngress = new HashMap<>();
        hdfsIngress.put("annotations", annotations);
        hdfsIngress.put("pathPrefix", "/*");

        Map<String, Object> hdfsIngressValues = new HashMap<>();
        hdfsIngressValues.put("ingress", hdfsIngress);


        eksCluster.addChart("testChart", HelmChartOptions.builder()
                .chart("hdfs")
                .repository("https://gchq.github.io/gaffer-docker")
                .release("hdfs-test")
                .values(hdfsIngressValues)
                .build());
    }

    private List<SubnetSelection> getSubnetsFromVpc(final String vpcId, final Ec2Client client) {
        List<SubnetSelection> subnetSelections = new ArrayList<>();

        subnetSelections.add(SubnetSelection.builder()
                .subnets(getSubnets(vpcId, client, "kubernetes.io/role/elb", "public"))
                .build());

        subnetSelections.add(SubnetSelection.builder()
                .subnets(getSubnets(vpcId, client, "kubernetes.io/role/internal-elb", "private"))
                .build());

        return subnetSelections;
    }


    private List<ISubnet> getSubnets(final String vpcId, final Ec2Client client, final String tag, final String subnetType) {
        DescribeSubnetsResponse subnetsResponse = client.describeSubnets(DescribeSubnetsRequest.builder()
                .filters(Filter.builder().name("vpc-id").values(vpcId).build(),
                        Filter.builder().name("tag-key").values(tag).build())
                .build());

        if (!subnetsResponse.hasSubnets()) {
            throw new IllegalArgumentException("Unable to detect any " + subnetType + " subnets. Make sure they're tagged with" +
                    " " + tag + "=1");
        }

        return subnetsResponse.subnets().stream()
                .map(subnet -> Subnet.fromSubnetAttributes(this, subnet.subnetId() + subnetType, SubnetAttributes.builder()
                        .subnetId(subnet.subnetId())
                        .availabilityZone(subnet.availabilityZone())
                        .build()))
                .collect(Collectors.toList());
    }

    private String getDefaultVpc(final Ec2Client client) {
        DescribeVpcsResponse describeVpcsResponse;
        describeVpcsResponse = client.describeVpcs(DescribeVpcsRequest.builder()
                .filters(Filter.builder().name("isDefault").values("true").build())
                .build());

        if (!describeVpcsResponse.hasVpcs()) {
            throw new IllegalArgumentException("Unable to detect default VPC");
        }

        return describeVpcsResponse.vpcs().get(0).vpcId();
    }

}
