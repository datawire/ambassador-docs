import React from 'react';

import AppleIcon from '@src/assets/icons/apple.inline.svg';
import LinuxIcon from '@src/assets/icons/linux.inline.svg';
import WindowsIcon from '@src/assets/icons/windows.inline.svg';
import PythonIcon from '@src/assets/icons/python.inline.svg';
import NodeJSIcon from '@src/assets/icons/nodejs.inline.svg';
import JavaIcon from '@src/assets/icons/java.inline.svg';
import GolangIcon from '@src/assets/icons/golang.inline.svg';

// prettier-ignore
export class AbstractTab extends React.Component {
  render() {
    const msg = `Platform.${this.constructor.name} may only be used directly inside of Platform.TabGroup`;
    throw new Error(msg);
    // eslint-disable-next-line no-unreachable
    return <span>{msg}</span>;
  }

  // Order determines the order of the tabs in the tab bar, from left
  // to right.
  static get order() { throw new Error('unimplemented - must use a concrete class'); }

  // If the user's OS isn't in the tab group, the tab with the highest
  // priority is the default tab.
  static get priority() { throw new Error('unimplemented - must use a concrete class'); }

  // The slug is most visible as the "?os={slug}" URL query parameter,
  // but it is also used internally by the TabGroup.
  static get slug() { throw new Error('unimplemented - must use a concrete class'); }

  // How the tab should appear in the tab bar.
  static get icon() { throw new Error('unimplemented - must use a concrete class'); }
  static get label() { throw new Error('unimplemented - must use a concrete class'); }

  // Detect whether this user is on this tab's platform.
  static detect(window) {
    throw new Error('unimplemented - must use a concrete class');
  }
}

// prettier-ignore
export class GNULinuxTab extends AbstractTab {
  static get order() { return 1; }
  static get priority() { return 3; }
  static get slug() { return 'gnu-linux'; }

  static get icon() { return LinuxIcon; }
  static get label() { return 'GNU/Linux'; }

  static detect(window) {
    return /Linux/.test(window.navigator.platform);
  }
}

// prettier-ignore
export class MacOSTab extends AbstractTab {
  static get order() { return 2; }
  static get priority() { return 2; }
  static get slug() { return 'macos'; }

  static get icon() { return AppleIcon; }
  static get label() { return 'macOS'; }

  static detect(window) {
    return /Mac(intosh|Intel|PPC|68K)/.test(window.navigator.platform);
  }
}

// prettier-ignore
export class WindowsTab extends AbstractTab {
  static get order() { return 3; }
  static get priority() { return 1; }
  static get slug() { return 'windows'; }

  static get icon() { return WindowsIcon; }
  static get label() { return 'Windows'; }

  static detect(window) {
    return /Win(dows|32|64|CE)/.test(window.navigator.platform);
  }
}

// prettier-ignore
export class PythonTab extends AbstractTab {
  static get order() { return 1; }
  static get priority() { return 4; }
  static get slug() { return 'python'; }

  static get icon() { return PythonIcon; }
  static get label() { return 'Python'; }

  static detect(window) {
    return /Mac(intosh|Intel|PPC|68K)/.test(window.navigator.platform);
  }
}

// prettier-ignore
export class NodeTab extends AbstractTab {
  static get order() { return 2; }
  static get priority() { return 3; }
  static get slug() { return 'nodejs'; }

  static get icon() { return NodeJSIcon; }
  static get label() { return 'NodeJS'; }

  static detect(window) {
    return /Mac(intosh|Intel|PPC|68K)/.test(window.navigator.platform);
  }
}

// prettier-ignore
export class JavaTab extends AbstractTab {
  static get order() { return 3; }
  static get priority() { return 2; }
  static get slug() { return 'java'; }

  static get icon() { return JavaIcon; }
  static get label() { return 'Java'; }

  static detect(window) {
    return /Mac(intosh|Intel|PPC|68K)/.test(window.navigator.platform);
  }
}

// prettier-ignore
export class GolangTab extends AbstractTab {
  static get order() { return 4; }
  static get priority() { return 1; }
  static get slug() { return 'golang'; }

  static get icon() { return GolangIcon; }
  static get label() { return 'Go'; }

  static detect(window) {
    return /Mac(intosh|Intel|PPC|68K)/.test(window.navigator.platform);
  }
}

// prettier-ignore
export class UnknownTab extends AbstractTab {
  static get slug() { return 'unknown'; }
}
