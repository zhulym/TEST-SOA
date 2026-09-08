import React, { useEffect } from 'react';

import { Menu } from 'antd';
import type { MenuProps } from 'antd';

import styles from './TreeContextMenu.module.scss';

interface IProps {
  visible: boolean;
  x: number;
  y: number;
  items: MenuProps['items'];
  onClose: () => void;
}

const TreeContextMenu = ({ visible, x, y, items, onClose }: IProps) => {
  useEffect(() => {
    if (!visible) {
      return;
    }

    const close = onClose;

    document.addEventListener('click', close);

    return () => {
      document.removeEventListener('click', close);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className={styles.wrapper} style={{ left: x, top: y }}>
      <Menu items={items} style={{ minWidth: 180 }} />
    </div>
  );
};

export default TreeContextMenu;
