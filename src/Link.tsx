/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';
import NextLink, { LinkProps } from 'next/link';
import MuiLink, { LinkProps as MuiLinkProps } from '@material-ui/core/Link';

export default function Link(props: LinkProps & MuiLinkProps) {
  const { as, href, className, color, children } = props;

  return (
    <MuiLink className={className} color={color}>
      <NextLink href={href} as={as}>
        <a>{children}</a>
      </NextLink>
    </MuiLink>
  );
}
