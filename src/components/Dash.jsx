import React from 'react';

import StatsRow from './StatsRow';
import ServicesRow from './ServiceRow';
import ChartsRow from './ChartsRow';

const Dash = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-text-light dark:text-text-dark text-3xl font-black leading-tight tracking-tight">
          Dashboard
        </h1>
      </div>
      {/*  <StatsRow /> <ChartsRow /> <ServicesRow /> */}

      <StatsRow></StatsRow>
      <ChartsRow></ChartsRow>
      <ServicesRow></ServicesRow>
    </div>
  );
};

export default Dash;
