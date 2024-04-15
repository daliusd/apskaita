import NextLink, { LinkProps } from 'next/link';
import { Anchor, type AnchorProps } from '@mantine/core';

export default function Link(
  props: LinkProps & AnchorProps & { children: React.ReactNode },
) {
  const { ...other } = props;

  return <Anchor component={NextLink} underline="hover" {...other} />;
}
