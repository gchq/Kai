import subprocess
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

standard_kubeconfig="/tmp/kubeconfig"

class HelmClient:
    __HELM_CMD="helm"

    def __init__(self, cluster_name, kubeconfig=standard_kubeconfig):
        subprocess.check_call([ 'aws', 'eks', 'update-kubeconfig',
        '--name', cluster_name,
        '--kubeconfig', kubeconfig
        ])
        self.cluster_name = cluster_name
        self.kubeconfig = kubeconfig

    def __run(self, instruction, release, values=None, chart=None, repo=None):
        """
        Runs a Helm command and returns True if it succeeds and False if it fails
        """
        cmd = [ self.__HELM_CMD, instruction, release ]
        if chart is not None:
            cmd.append(chart)
        if repo is not None:
            cmd.extend(["--repo", repo])
        if values is not None:
            cmd.extend(["--values", values])
        cmd.extend(["--kubeconfig", self.kubeconfig])

        succeeded=False
        try:
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=True, cwd="/tmp")
            succeeded=True
        except subprocess.CalledProcessError as err:
            logger.error("Error during %s of %s", instruction, release)
            logger.error(err.output)
        
        return succeeded

    def install_chart(self, release, values=None, chart="gaffer", repo="https://gchq.github.io/gaffer-docker"):
        """
        Installs a Helm chart and returns True if it Succeeds and False if it fails
        """
        return self.__run(instruction="install", release=release, values=values, chart=chart, repo=repo)

    def uninstall_chart(self, release):
        """
        Uninstalls a Helm release and returns True if it Succeeds and False if it fails
        """
        return self.__run(instruction="uninstall", release=release)

    