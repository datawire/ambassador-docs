import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import CodeBlock from '../../../../../src/components/CodeBlock/CodeBlock'
import HelmIcon from '../../../../../src/assets/icons/helm.inline.svg';
import KubernetesIcon from '../../../../../src/assets/icons/kubernetes.inline.svg';
import TerminalIcon from '../../../../../src/assets/icons/terminal.inline.svg';


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: 'transparent',

  },

}));

export default function SimpleTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar elevation={0} style={{ background: 'transparent', color: 'black', borderBottom: '1px solid #e8e8e8', }} position="static">
        <Tabs TabIndicatorProps={{ style: { background: '#AF5CF8' } }} value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab icon={<HelmIcon />} label="Helm 3" {...a11yProps(0)} style={{ minWidth: "10%", textTransform: 'none' }} />
          <Tab icon={<HelmIcon />} label="Helm 2" {...a11yProps(1)} style={{ minWidth: "10%", textTransform: 'none' }} />
          <Tab icon={<KubernetesIcon />} label="Kubernetes YAML" {...a11yProps(2)} style={{ minWidth: "10%", textTransform: 'none' }} />
          <Tab icon={<TerminalIcon />} label="Quick CLI Install" {...a11yProps(3)} style={{ minWidth: "10%", textTransform: 'none' }} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>

        {/*Helm 3 install instructions*/}

        <CodeBlock>
          {
            '# Add the Repo:' +
            '\n' +
            'helm repo add datawire https://www.getambassador.io' +
            '\n \n' +
            '# Create Namespace and Install:' +
            '\n' +
            'kubectl create namespace ambassador && \\' +
            '\n' +
            'helm install ambassador --namespace ambassador datawire/ambassador && \\' +
            '\n' +
            'kubectl -n ambassador wait --for condition=available --timeout=90s deploy -lproduct=aes'
          }
        </CodeBlock>

      </TabPanel>

      <TabPanel value={value} index={1}>

        {/*Helm 2 install instructions*/}

        <CodeBlock>
          {
            '# Add the Repo:' +
            '\n' +
            'helm repo add datawire https://www.getambassador.io' +
            '\n \n' +
            '# Create Namespace and Install:' +
            '\n' +
            'kubectl create namespace ambassador && \\' +
            '\n' +
            'helm install --name ambassador --namespace ambassador datawire/ambassador && \\' +
            '\n' +
            'kubectl -n ambassador wait --for condition=available --timeout=90s deploy -lproduct=aes'
          }
        </CodeBlock>

      </TabPanel>

      <TabPanel value={value} index={2}>

        {/*YAML install instructions*/}

        <CodeBlock>
          {
            'kubectl apply -f https://www.getambassador.io/yaml/aes-crds.yaml && \\' +
            '\n' +
            'kubectl wait --for condition=established --timeout=90s crd -lproduct=aes && \\' +
            '\n' +
            'kubectl apply -f https://www.getambassador.io/yaml/aes.yaml && \\' +
            '\n' +
            'kubectl -n ambassador wait --for condition=available --timeout=90s deploy -lproduct=aes' +
            '\n'
          }
        </CodeBlock>

      </TabPanel>

      <TabPanel value={value} index={3}>

        {/*Edgectl install instructions*/}
        <CodeBlock>
          {
            '# macOS:' +
            '\n' +
            'sudo curl -fL https://metriton.datawire.io/downloads/darwin/edgectl \\' +
            '\n' +
            '   -o /usr/local/bin/edgectl &&' +
            '\n' +
            'sudo chmod a+x /usr/local/bin/edgectl &&' +
            '\n' +
            'edgectl install' +
            '\n \n' +
            '# Linux:' +
            '\n' +
            'sudo curl -fL https://metriton.datawire.io/downloads/linux/edgectl \\' +
            '\n' +
            '   -o /usr/local/bin/edgectl &&' +
            '\n' +
            'sudo chmod a+x /usr/local/bin/edgectl &&' +
            '\n' +
            'edgectl install' +
            '\n \n' +
            '# Windows:' +
            '\n' +
            '# Download here - https://metriton.datawire.io/downloads/windows/edgectl.exe'

          }
        </CodeBlock>

      </TabPanel>
    </div >
  );
}