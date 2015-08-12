/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('lodash'),
    engineTools = require('../tools'),
    nowdoc = require('nowdoc'),
    phpCommon = require('phpcommon'),
    phpTools = require('../../tools'),
    PHPParseError = phpCommon.PHPParseError;

describe('PHP Engine syntax error handling integration', function () {
    var engine;

    function check(scenario) {
        engineTools.check(function () {
            return {
                engine: engine
            };
        }, scenario);
    }

    beforeEach(function () {
        engine = phpTools.createEngine();
    });

    _.each({
        'function call missing end semicolon': {
            code: nowdoc(function () {/*<<<EOS
<?php
    open()
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPParseError,
                match: /^PHP Parse error: syntax error, unexpected \$end in \(program\) on line 2$/
            },
            expectedStderr: 'PHP Parse error: syntax error, unexpected $end in (program) on line 2',
            expectedStdout: ''
        },
        'function call missing end semicolon in required module': {
            code: nowdoc(function () {/*<<<EOS
<?php
    require_once 'syntax_error.php';
EOS
*/;}), // jshint ignore:line
            options: {
                'include': function (path, promise) {
                    promise.resolve('<?php open()');
                }
            },
            expectedException: {
                instanceOf: PHPParseError,
                match: /^PHP Parse error: syntax error, unexpected \$end in syntax_error\.php on line 1$/
            },
            expectedStderr: 'PHP Parse error: syntax error, unexpected $end in syntax_error.php on line 1',
            expectedStdout: ''
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
