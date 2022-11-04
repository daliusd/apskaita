/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';
import NextLink, { LinkProps } from 'next/link';
import MuiLink, { LinkProps as MuiLinkProps } from '@material-ui/core/Link';

export default function Link(props: LinkProps & MuiLinkProps) {
  const { className, ...other } = props;

  return <MuiLink component={NextLink} className={className} {...other} />;
}
