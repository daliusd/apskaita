import { describe, expect, it } from 'vitest';

import { getPriceInWords } from './priceinwords';

describe('getPriceInWords tests', () => {
  it('works with zero', () => {
    expect(getPriceInWords(0)).toEqual('nulis eurų');
  });

  it('works with some numbers below 20', () => {
    expect(getPriceInWords(1)).toEqual('vienas euras');
    expect(getPriceInWords(2)).toEqual('du eurai');
    expect(getPriceInWords(9)).toEqual('devyni eurai');
    expect(getPriceInWords(11)).toEqual('vienuolika eurų');
    expect(getPriceInWords(19)).toEqual('devyniolika eurų');
  });

  it('works with some numbers between 20 and below 100', () => {
    expect(getPriceInWords(20)).toEqual('dvidešimt eurų');
    expect(getPriceInWords(21)).toEqual('dvidešimt vienas euras');
    expect(getPriceInWords(22)).toEqual('dvidešimt du eurai');
    expect(getPriceInWords(29)).toEqual('dvidešimt devyni eurai');
    expect(getPriceInWords(95)).toEqual('devyniasdešimt penki eurai');
  });

  it('works with hundreds', () => {
    expect(getPriceInWords(100)).toEqual('vienas šimtas eurų');
    expect(getPriceInWords(201)).toEqual('du šimtai vienas euras');
    expect(getPriceInWords(516)).toEqual('penki šimtai šešiolika eurų');
    expect(getPriceInWords(720)).toEqual('septyni šimtai dvidešimt eurų');
    expect(getPriceInWords(852)).toEqual(
      'aštuoni šimtai penkiasdešimt du eurai',
    );
  });

  it('works with thousands', () => {
    expect(getPriceInWords(1000)).toEqual('vienas tūkstantis eurų');
    expect(getPriceInWords(1101)).toEqual(
      'vienas tūkstantis vienas šimtas vienas euras',
    );
    expect(getPriceInWords(11413)).toEqual(
      'vienuolika tūkstančių keturi šimtai trylika eurų',
    );
    expect(getPriceInWords(42000)).toEqual(
      'keturiasdešimt du tūkstančiai eurų',
    );
    expect(getPriceInWords(217712)).toEqual(
      'du šimtai septyniolika tūkstančių septyni šimtai dvylika eurų',
    );
  });

  it('works with millions', () => {
    expect(getPriceInWords(1000000)).toEqual('vienas milijonas eurų');
    expect(getPriceInWords(1101101)).toEqual(
      'vienas milijonas vienas šimtas vienas tūkstantis vienas šimtas vienas euras',
    );
    expect(getPriceInWords(101101101)).toEqual(
      'vienas šimtas vienas milijonas vienas šimtas vienas tūkstantis vienas šimtas vienas euras',
    );
    expect(getPriceInWords(123456789)).toEqual(
      'vienas šimtas dvidešimt trys milijonai keturi šimtai penkiasdešimt šeši tūkstančiai septyni šimtai aštuoniasdešimt devyni eurai',
    );
    expect(getPriceInWords(987654321)).toEqual(
      'devyni šimtai aštuoniasdešimt septyni milijonai šeši šimtai penkiasdešimt keturi tūkstančiai trys šimtai dvidešimt vienas euras',
    );
  });

  it('works with billions', () => {
    expect(getPriceInWords(999987654321)).toEqual(
      'devyni šimtai devyniasdešimt devyni milijardai devyni šimtai aštuoniasdešimt septyni milijonai šeši šimtai penkiasdešimt keturi tūkstančiai trys šimtai dvidešimt vienas euras',
    );
  });
});
