import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import React from 'react';

import HelmIcon from '../../../../../src/assets/icons/helm.inline.svg';
import KubernetesIcon from '../../../../../src/assets/icons/kubernetes.inline.svg';
import CodeBlock from '../../../../../src/components/CodeBlock';

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
      {value === index && <Box p={3}>{children}</Box>}
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

export default function GettingStartedEdgeStack20Tabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar
        elevation={0}
        style={{
          background: 'transparent',
          color: 'black',
          borderBottom: '1px solid #e8e8e8',
        }}
        position="static"
      >
        <Tabs
          TabIndicatorProps={{ style: { background: '#AF5CF8' } }}
          value={value}
          onChange={handleChange}
          aria-label="simple tabs example"
        >
          <Tab
            icon={<HelmIcon loading="lazy" />}
            label="Helm 3"
            {...a11yProps(0)}
            style={{ minWidth: '10%', textTransform: 'none' }}
          />
          <Tab
            icon={<KubernetesIcon loading="lazy" />}
            label="Kubernetes YAML"
            {...a11yProps(1)}
            style={{ minWidth: '10%', textTransform: 'none' }}
          />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        {/*Helm 3 install instructions*/}

        <CodeBlock>
          {'# Add the Repo:' +
            '\n' +
            'helm repo add argo https://argoproj.github.io/argo-helm' +
            '\n' +
            'helm repo update' +
            '\n\n' +
            '# Create ArgoCD namespace and install:' +
            '\n' +
            'kubectl create namespace argocd && \\' +
            '\n' +
            'helm install --namespace argocd --generate-name argo/argo-cd' +
            '\n\n' +
            '# Create Argo Rollouts namespace and install:' +
            '\n' +
            'kubectl create namespace argo-rollouts && \\' +
            '\n' +
            'helm install --namespace argo-rollouts --generate-name argo/argo-rollouts' +
            '\n'}
        </CodeBlock>
      </TabPanel>

      <TabPanel value={value} index={1}>
        {/*YAML install instructions*/}

        <CodeBlock>
          {'# Create ArgoCD namespace and install:' +
            '\n' +
            'kubectl create namespace argocd' +
            '\n' +
            'kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml' +
            '\n\n' +
            '# Create Argo Rollouts namespace and install:' +
            '\n' +
            'kubectl create namespace argo-rollouts' +
            '\n' +
            'kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/download/v1.1.0/install.yaml' +
            '\n'}
        </CodeBlock>
      </TabPanel>
    </div>
  );
}
