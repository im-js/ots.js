'use strict';

/**
 * https://help.aliyun.com/document_detail/50600.html?spm=5176.doc27305.2.2.8fuORx
 */
const connection = require('../lib/connection');

// primary_key: [
//     {
//         name: "key1",
//         value: {
//          type: 'STRING',
//          v_string: 'value string'
//         }
//     }
// ]

function genBuf() {
    protobuf.load('../lib/proto/table_store.proto', function (err, root) {
        if (err)
            throw err;
        
        let buf1 = Buffer.from([
            0x75,
            0x00,
            0x00,
            0x00, // tag_header
            0x01, // tag_pk
            0x03, // tag_cell
        ]);

        // cell name format
        let bufkey = Buffer.from('pk');
        let formatKey = Buffer.concat([
            Buffer.from([0x04, bufkey.length, 0x00, 0x00, 0x00]),
            bufkey
        ]);

        // cell value format
        let bufvalue = Buffer.from('pkValue');
        let formatValue = Buffer.concat([
            Buffer.from([0x05, 0x03, bufvalue.length, 0x00, 0x00, 0x00]),
            bufvalue
        ]);

        let payload = {
            tableName: 'sampleTable',
            primaryKey: Buffer.from('7500000001030402000000706b050c0000000307000000706b56616c75650a8509f7', 'hex'),
            maxVersions: 1
            // primaryKey: Buffer.concat([
            //     buf1,
            //     formatKey,
            //     formatValue
            // ])
        };

        let GetRowRequest = root.lookupType('com.alicloud.openservices.tablestore.core.protocol.GetRowRequest');

        let errMsg = GetRowRequest.verify(payload);

        if (errMsg)
            throw Error(errMsg);
        
        let message = GetRowRequest.create(payload);
        let buffer = GetRowRequest.encode(message).finish();

        let data = buffer.toString('hex');

        let cs = '';
        for(let i = 0; i < data.length;) {
            cs += data.substr(i, 2) + ':';
            i+=2;
        }
        console.log(cs);

        req(data);
    });
}

function req(data) {
    connection.req('GetRow', data);
    
}

genBuf();

/**

0a:0b:73:61:6d:70:6c:65:54:61:62:6c:65:12:22:

-- plain buffer start
75:00:00:00:01:03:
04:02:00:00:00:70:6b: // formatvalue

05:0c:00:00:00:

03:07:00:00:00:70:6b:56:61:6c:75:65 // formatvalue


:0a:85:09:f7

:28:01

 */