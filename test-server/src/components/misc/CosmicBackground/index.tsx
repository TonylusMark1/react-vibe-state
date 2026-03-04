import * as React from 'react';

import styles from './index.module.css';

//

export const CosmicBackground = React.memo(function CosmicBackground() {
  return (
    <div className={styles.cosmos}>
      {/* Static stars layers */}
      <div className={styles.starsSmall} />
      <div className={styles.starsMedium} />
      <div className={styles.starsLarge} />
      
      {/* Floating particles */}
      <div className={styles.particles}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>
      
      {/* Subtle nebula glows */}
      <div className={styles.nebula1} />
      <div className={styles.nebula2} />
      <div className={styles.nebula3} />
    </div>
  );
});
