import subprocess
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

standard_kubeconfig="/tmp/kubeconfig"


class CommandHelper:
    @staticmethod
    def run_command(cmd, release_name):
        succeeded=False
        try:
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=True, cwd="/tmp")
            succeeded=True
        except subprocess.CalledProcessError as err:
            logger.error("Error during excution of command: %s against release name: %s", cmd, release_name)
            logger.error(err.output)

        return succeeded


class KubeConfigurator:
    def run_once(f):
        def wrapper(*args, **kwargs):
            if not wrapper.has_run:
                wrapper.has_run = True
                return f(*args, **kwargs)
        wrapper.has_run = False
        return wrapper

    @run_once
    def update_kube_config(self, cluster_name, kubeconfig=standard_kubeconfig):
        logger.info("Configuring kubectl for cluster: %s", cluster_name);
        subprocess.check_call([ 'aws', 'eks', 'update-kubeconfig',
        '--name', cluster_name,
        '--kubeconfig', kubeconfig
        ])


class HelmClient:
    __HELM_CMD="helm"

    def __init__(self, cluster_name, kubeconfig=standard_kubeconfig):
        KubeConfigurator().update_kube_config(cluster_name=cluster_name, kubeconfig=kubeconfig)
        self.kubeconfig = kubeconfig

    def __run(self, instruction, release_name, values=None, chart=None, repo=None):
        """
        Runs a Helm command and returns True if it succeeds and False if it fails
        """
        cmd = [ self.__HELM_CMD, instruction, release_name ]
        if chart is not None:
            cmd.append(chart)
        if repo is not None:
            cmd.extend(["--repo", repo])
        if values is not None:
            cmd.extend(["--values", values])
        cmd.extend(["--kubeconfig", self.kubeconfig])

        return CommandHelper.run_command(cmd, release_name)

    def install_chart(self, release_name, values=None, chart="gaffer", repo="https://gchq.github.io/gaffer-docker"):
        """
        Installs a Helm chart and returns True if it Succeeds and False if it fails
        """
        return self.__run(instruction="install", release_name=release_name, values=values, chart=chart, repo=repo)

    def uninstall_chart(self, release_name):
        """
        Uninstalls a Helm release and returns True if it Succeeds and False if it fails
        """
        return self.__run(instruction="uninstall", release_name=release_name)


class KubernetesClient:
    __KUBECTL_CMD="kubectl"

    def __init__(self, cluster_name, kubeconfig=standard_kubeconfig):
        KubeConfigurator().update_kube_config(cluster_name=cluster_name, kubeconfig=kubeconfig)
        self.kubeconfig = kubeconfig

    def delete_volumes(self, release_name):
        """
        Deletes the Persistent Volume Claims associated to a release_name
        """
        # HDFS Datanodes & Namenode
        self.__delete_volumes(release_name=release_name, selectors=["app.kubernetes.io/instance={}".format(release_name)])

        # Zookeeper
        self.__delete_volumes(release_name=release_name, selectors=["release={}".format(release_name)])

    def __delete_volumes(self, release_name, selectors):
        cmd = [ self.__KUBECTL_CMD, "delete", "pvc", "--kubeconfig", self.kubeconfig ]
        for selector in selectors:
            cmd.append("--selector")
            cmd.append(selector)

        CommandHelper.run_command(cmd, release_name)

    def create_namespace(self, namespace_name):
        cmd = [ self.__KUBECTL_CMD, "create", "namespace", namespace_name, "--kubeconfig", self.kubeconfig ]
        return CommandHelper.run_command(cmd, namespace_name)

    def delete_namespace(self, namespace_name):
        cmd = [ self.__KUBECTL_CMD, "delete", "namespace", namespace_name, "--kubeconfig", self.kubeconfig ]
        return CommandHelper.run_command(cmd, namespace_name)
