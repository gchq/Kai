import subprocess
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

standard_kubeconfig="/tmp/kubeconfig"


class CommandHelper:
    @staticmethod
    def run_command(cmd, namespace_name):
        succeeded=False
        try:
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=True, cwd="/tmp")
            succeeded=True
        except subprocess.CalledProcessError as err:
            logger.error("Error during excution of command: %s against namespace name: %s", cmd, namespace_name)
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


class KubernetesClient:
    __KUBECTL_CMD="kubectl"

    def __init__(self, cluster_name, kubeconfig=standard_kubeconfig):
        KubeConfigurator().update_kube_config(cluster_name=cluster_name, kubeconfig=kubeconfig)
        self.kubeconfig = kubeconfig

    def create_namespace(self, namespace_name):
        cmd = [ self.__KUBECTL_CMD, "create", "namespace", namespace_name, "--kubeconfig", self.kubeconfig ]
        return CommandHelper.run_command(cmd, namespace_name)

    def delete_namespace(self, namespace_name):
        cmd = [ self.__KUBECTL_CMD, "delete", "namespace", namespace_name, "--kubeconfig", self.kubeconfig ]
        return CommandHelper.run_command(cmd, namespace_name)
