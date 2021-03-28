import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLocalStorage } from 'react-recipes';

import { defaultOrFirst } from '../utils/query';

export default function Experiments() {
  const router = useRouter();

  const [, setExperiments] = useLocalStorage('experiments', '');
  const { value } = router.query;

  useEffect(() => {
    setExperiments(defaultOrFirst(value));

    router.replace('/');
  }, [value, router, setExperiments]);

  return <div>Experiments</div>;
}
