import React from 'react';

const Table = () => {
  return (
    <table style={{ width: '100%' }}>
      <colgroup>
        <col span="1" style={{ width: '15%' }}></col>
        <col span="1" style={{ width: '85%' }}></col>
      </colgroup>

      <thead>
        <tr>
          <th style={{ textAlign: 'center' }}>Project</th>
          <th>Instructions</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td style={{ textAlign: 'center' }}>
            <a href="https://kind.sigs.k8s.io/" target="_blank">
              <img
                width={75}
                src="https://raw.githubusercontent.com/kubernetes-sigs/kind/main/logo/logo.png"
              />
            </a>
          </td>
          <td>
            <a
              href="https://kind.sigs.k8s.io/docs/user/ingress/"
              target="_blank"
            >
              KIND
            </a>{' '}
            documentation.
          </td>
        </tr>
        <tr>
          <td style={{ textAlign: 'center' }}>
            <a href="https://kubespray.io" target="_blank">
              <img width={75} src="https://kubespray.io/logo/logo-clear.png" />
            </a>
          </td>
          <td>
            <a href="https://kubespray.io/" target="_blank">
              kubespray
            </a>{' '}
            documentation.
          </td>
        </tr>
        <tr>
          <td style={{ textAlign: 'center' }}>
            <a href="https://kops.sigs.k8s.io" target="_blank">
              <img
                width={75}
                src="https://github.com/kubernetes/kops/raw/master/docs/img/logo-notext.png"
              />
            </a>
          </td>
          <td>
            <a href="https://kops.sigs.k8s.io/addons/" target="_blank">
              KOPS
            </a>{' '}
            documentation.
          </td>
        </tr>
        <tr>
          <td style={{ textAlign: 'center' }}>
            <a href="https://microk8s.io/" target="_blank">
              <img
                width={75}
                src="https://ubuntu.com/wp-content/uploads/305a/microk8s-sticker.png"
              />
            </a>
          </td>
          <td>
            <a href="https://microk8s.io/docs/addon-ambassador" target="_blank">
              microk8s
            </a>{' '}
            documentation.
          </td>
        </tr>
      </tbody>
    </table>
  );
};
export default Table;
