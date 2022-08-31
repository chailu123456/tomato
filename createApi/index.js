#!/usr/bin/env node
const { argv } = require('process');

const { main } = require('./template');
main(argv[2] || '');
