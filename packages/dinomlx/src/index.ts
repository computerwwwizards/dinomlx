#!/usr/bin/env node


import { type ReadStream } from "node:fs";
import { Readable } from "node:stream";

import { CSSRegisterLayerImpl } from './css-register';
export { CSSRegisterLayerImpl, type CSSRegister, type CSSRegisterLayer, type CSSRegisterOptions } from './css-register';

export * from './types';
export { HTMLTemplateCompilerImpl } from './html-compiler';
