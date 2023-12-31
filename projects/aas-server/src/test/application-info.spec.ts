/******************************************************************************
 *
 * Copyright (c) 2019-2023 Fraunhofer IOSB-INA Lemgo,
 * eine rechtlich nicht selbstaendige Einrichtung der Fraunhofer-Gesellschaft
 * zur Foerderung der angewandten Forschung e.V.
 *
 *****************************************************************************/

import 'reflect-metadata';
import { resolve } from 'path';
import { ApplicationInfo } from '../app/application-info.js';
import { Logger } from '../app/logging/logger.js';
import { readFile } from 'fs/promises';
import { PackageInfo } from 'common';
import { createSpyObj } from './utils.js';
import { describe, beforeEach, it, expect } from '@jest/globals';

describe('Application Info service', function () {
    let logger: Logger;
    let applicationInfo: ApplicationInfo;
    let file: string;

    beforeEach(function () {
        logger = createSpyObj<Logger>(['error', 'warning', 'info', 'debug', 'start', 'stop']);
        file = resolve('.', 'src/test/assets/app-info.json');
        applicationInfo = new ApplicationInfo(logger);
    });

    it('gets the AASServer package info', async function () {
        const expected: PackageInfo = JSON.parse((await readFile(file)).toString());
        await expect(applicationInfo.getAsync(file)).resolves.toEqual(expected);
    });
});