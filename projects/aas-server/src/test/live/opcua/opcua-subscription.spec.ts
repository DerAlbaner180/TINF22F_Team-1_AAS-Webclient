/******************************************************************************
 *
 * Copyright (c) 2019-2023 Fraunhofer IOSB-INA Lemgo,
 * eine rechtlich nicht selbstaendige Einrichtung der Fraunhofer-Gesellschaft
 * zur Foerderung der angewandten Forschung e.V.
 *
 *****************************************************************************/

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { OpcuaSubscription } from '../../../app/live/opcua/opcua-subscription.js';
import { createSpyObj } from '../../utils.js';
import { Logger } from '../../../app/logging/logger.js';
import { SocketClient } from '../../../app/live/socket-client.js';
import { OpcuaServer } from '../../../app/packages/opcua/opcua-server.js';

describe('OpcuaSubscription', function () {
    let subscription: OpcuaSubscription;
    let logger: jest.Mocked<Logger>;
    let client: jest.Mocked<SocketClient>;
    let server: jest.Mocked<OpcuaServer>;

    beforeEach(function () {
        logger = createSpyObj<Logger>(['error', 'warning', 'info', 'debug', 'start', 'stop']);
        client = createSpyObj<SocketClient>(['has', 'subscribe', 'notify']);
        server = createSpyObj<OpcuaServer>(['getSession']);
        subscription = new OpcuaSubscription(logger, client, server, [{
            nodeId: 'ns=1;i=42',
            valueType: 'xs:integer'
        }]);
    });

    it('should be created', function() {
        expect(subscription).toBeTruthy();
    });
});