import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.background}>
      <img src="../image/meatq6mo-nzvz3ly.png" className={styles.a01} />
      <div className={styles.group4}>
        <p className={styles.buildYourOwnTeamLibr}>Build your own team library</p>
        <p className={styles.donTReinventTheWheel}>
          Don’t reinvent the wheel with every design. Team libraries let you share
          styles and components across files, with everyone on your team.
        </p>
      </div>
    </div>
  );
}

export default Component;
