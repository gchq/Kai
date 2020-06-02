package uk.gov.gchq.kai.platform;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import software.amazon.awscdk.services.iam.ManagedPolicyProps;
import software.amazon.awscdk.services.iam.OpenIdConnectPrincipal;
import software.amazon.awscdk.services.iam.OpenIdConnectProvider;
import software.amazon.awscdk.services.iam.PolicyDocument;
import software.amazon.awscdk.services.iam.Role;
import software.amazon.awscdk.services.iam.RoleProps;
import software.amazon.awscdk.services.iam.ServicePrincipal;
import software.amazon.awssdk.services.ec2.Ec2Client;
import software.amazon.awssdk.services.ec2.model.DescribeSubnetsRequest;
import software.amazon.awssdk.services.ec2.model.DescribeSubnetsResponse;
import software.amazon.awssdk.services.ec2.model.DescribeVpcsRequest;
import software.amazon.awssdk.services.ec2.model.DescribeVpcsResponse;
import software.amazon.awssdk.services.ec2.model.Filter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class GraphPlatformStack extends Stack {
    private static final Logger LOGGER = LoggerFactory.getLogger(GraphPlatformStack.class);
    public static final String DEFAULT_VPC = "DEFAULT";

    public GraphPlatformStack(@NotNull Construct scope, @NotNull String id) {
        this(scope, id, null);
    }

    public GraphPlatformStack(@NotNull Construct scope, @NotNull String id, @Nullable StackProps props) {
        super(scope, id, props);

        // todo convert strings to constants
        String vpc = (String) this.getNode().tryGetContext("vpcId");
        String clusterName = (String) this.getNode().tryGetContext("clusterName");


        // todo split into smaller readable methods
        // Basic Cluster Properties
        ClusterProps.Builder clusterPropertiesBuilder = ClusterProps.builder()
                .clusterName(clusterName)
                .kubectlEnabled(true);

        // Vpc
        Ec2Client client = Ec2Client.create();
        List<SubnetSelection> subnets = null;

        if (DEFAULT_VPC.equals(vpc)) {
            vpc = getDefaultVpc(client);
            LOGGER.debug("Using Default VPC: " + vpc);
        }

        IVpc clusterVpc = Vpc.fromLookup(this, clusterName + "Vpc", VpcLookupOptions.builder()
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

        Cluster eksCluster = new Cluster(this, clusterName + "EksCluster", clusterPropertiesBuilder.build());

        // Create OIDC Provider

        OpenIdConnectProvider provider = eksCluster.getOpenIdConnectProvider();

        // Pull policy document from github
        JsonNode policyDocumentJson;
        String policyUrl = "https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.6/docs/examples/iam-policy.json";
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(new URL(policyUrl).openStream()))) {
            String jsonString = reader.lines().collect(Collectors.joining("\n"));
            ObjectMapper mapper = new ObjectMapper();
            policyDocumentJson = mapper.readTree(jsonString);
        } catch (MalformedURLException e) {
            throw new RuntimeException(policyUrl + " is Malformed", e);
        } catch (IOException e) {
            throw new RuntimeException("Failed to download Policy from " + policyUrl, e);
        }

        IManagedPolicy aLBIngressPolicy = new ManagedPolicy(this, "ALBIngressPolicy", ManagedPolicyProps.builder()
                .document(PolicyDocument.fromJson(policyDocumentJson))
                .build());

        // Create Role from Policy

        // todo add conditions to this principal according to https://github.com/helm/charts/issues/20504#issuecomment-596915999

        IRole aLBIngressRole = new Role(this, "ALBIngressRole", RoleProps.builder()
                .assumedBy(new OpenIdConnectPrincipal(provider))
                .managedPolicies(Collections.singletonList(aLBIngressPolicy))
                .build());

        Map<String, Object> ingressValues = new HashMap<>();
        ingressValues.put("clusterName", clusterName);
        ingressValues.put("autoDiscoverAwsRegion", true);
        ingressValues.put("autoDiscoverAwsVpcID", true);

        // todo refactor this
        Map<String, Object> albServiceAccountAnnotations = new HashMap<>();
        albServiceAccountAnnotations.put("eks.amazonaws.com/role-arn", aLBIngressRole.getRoleArn());

        Map<String, Object> serviceAccountValues = new HashMap<>();
        serviceAccountValues.put("annotations", albServiceAccountAnnotations);

        Map<String, Object> rbacValues = new HashMap<>();
        rbacValues.put("serviceAccount", serviceAccountValues);
        ingressValues.put("rbac", rbacValues);

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

        // todo again refactor this
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
                .release("hdfs")
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
