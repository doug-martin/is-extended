(function () {
    "use strict";

    function defineIsa(extended) {

        var undef, pSlice = Array.prototype.slice;

        function argsToArray(args, slice) {
            slice = slice || 0;
            return pSlice.call(args, slice);
        }

        function keys(obj) {
            var ret = [];
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    ret.push(i);
                }
            }
            return ret;
        }

        //taken from node js assert.js
        //https://github.com/joyent/node/blob/master/lib/assert.js
        function deepEqual(actual, expected) {
            // 7.1. All identical values are equivalent, as determined by ===.
            if (actual === expected) {
                return true;

            } else if (typeof Buffer !== "undefined" && Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
                if (actual.length !== expected.length) {
                    return false;
                }

                for (var i = 0; i < actual.length; i++) {
                    if (actual[i] !== expected[i]) {
                        return false;
                    }
                }

                return true;

                // 7.2. If the expected value is a Date object, the actual value is
                // equivalent if it is also a Date object that refers to the same time.
            } else if (actual instanceof Date && expected instanceof Date) {
                return actual.getTime() === expected.getTime();

                // 7.3 If the expected value is a RegExp object, the actual value is
                // equivalent if it is also a RegExp object with the same source and
                // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
            } else if (actual instanceof RegExp && expected instanceof RegExp) {
                return actual.source === expected.source &&
                    actual.global === expected.global &&
                    actual.multiline === expected.multiline &&
                    actual.lastIndex === expected.lastIndex &&
                    actual.ignoreCase === expected.ignoreCase;

                // 7.4. Other pairs that do not both pass typeof value == 'object',
                // equivalence is determined by ==.
            } else if (isString(actual) && isString(expected) && actual !== expected) {
                return false;
            } else if (typeof actual !== 'object' && typeof expected !== 'object') {
                return actual === expected;

                // 7.5 For all other Object pairs, including Array objects, equivalence is
                // determined by having the same number of owned properties (as verified
                // with Object.prototype.hasOwnProperty.call), the same set of keys
                // (although not necessarily the same order), equivalent values for every
                // corresponding key, and an identical 'prototype' property. Note: this
                // accounts for both named and indexed properties on Arrays.
            } else {
                return objEquiv(actual, expected);
            }
        }


        function objEquiv(a, b) {
            var key;
            if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) {
                return false;
            }
            // an identical 'prototype' property.
            if (a.prototype !== b.prototype) {
                return false;
            }
            //~~~I've managed to break Object.keys through screwy arguments passing.
            //   Converting to array solves the problem.
            if (isArguments(a)) {
                if (!isArguments(b)) {
                    return false;
                }
                a = pSlice.call(a);
                b = pSlice.call(b);
                return deepEqual(a, b);
            }
            try {
                var ka = keys(a),
                    kb = keys(b),
                    i;
                // having the same number of owned properties (keys incorporates
                // hasOwnProperty)
                if (ka.length !== kb.length) {
                    return false;
                }
                //the same set of keys (although not necessarily the same order),
                ka.sort();
                kb.sort();
                //~~~cheap key test
                for (i = ka.length - 1; i >= 0; i--) {
                    if (ka[i] !== kb[i]) {
                        return false;
                    }
                }
                //equivalent values for every corresponding key, and
                //~~~possibly expensive deep test
                for (i = ka.length - 1; i >= 0; i--) {
                    key = ka[i];
                    if (!deepEqual(a[key], b[key])) {
                        return false;
                    }
                }
            } catch (e) {//happens when one is a string literal and the other isn't
                return false;
            }
            return true;
        }

        function isFunction(obj) {
            return typeof obj === "function";
        }

        function isObject(obj) {
            var undef;
            return obj !== null && obj !== undef && typeof obj === "object";
        }

        function isHash(obj) {
            var ret = isObject(obj);
            return ret && obj.constructor === Object;
        }

        function isEmpty(object) {
            if (isObject(object)) {
                for (var i in object) {
                    if (object.hasOwnProperty(i)) {
                        return false;
                    }
                }
            } else if (isString(object) && object === "") {
                return true;
            }
            return true;
        }

        function isBoolean(obj) {
            return Object.prototype.toString.call(obj) === "[object Boolean]";
        }

        function isUndefined(obj) {
            return obj !== null && obj === undef;
        }

        function isDefined(obj) {
            return !isUndefined(obj);
        }

        function isUndefinedOrNull(obj) {
            return isUndefined(obj) || isNull(obj);
        }

        function isNull(obj) {
            return obj !== undef && obj === null;
        }


        var isArguments = function _isArguments(object) {
            return !isUndefinedOrNull(object) && Object.prototype.toString.call(object) === '[object Arguments]';
        };

        if (!isArguments(arguments)) {
            isArguments = function _isArguments(obj) {
                return !!(obj && obj.hasOwnProperty("callee"));
            };
        }


        function isInstanceOf(obj, clazz) {
            if (isFunction(clazz)) {
                return obj instanceof clazz;
            } else {
                return false;
            }
        }

        function isRegExp(obj) {
            return !isUndefinedOrNull(obj) && (obj instanceof RegExp);
        }

        function isArray(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        }

        function isDate(obj) {
            return (!isUndefinedOrNull(obj) && typeof obj === "object" && obj instanceof Date);
        }

        function isString(obj) {
            return !isUndefinedOrNull(obj) && (typeof obj === "string" || obj instanceof String);
        }

        function isNumber(obj) {
            return !isUndefinedOrNull(obj) && (typeof obj === "number" || obj instanceof Number);
        }

        function isTrue(obj) {
            return obj === true;
        }

        function isFalse(obj) {
            return obj === false;
        }

        function isNotNull(obj) {
            return !isNull(obj);
        }

        function isEq(obj, obj2) {
            return obj == obj2;
        }

        function isNeq(obj, obj2) {
            /*jshint eqeqeq:false*/
            return obj != obj2;
        }

        function isSeq(obj, obj2) {
            return obj === obj2;
        }

        function isSneq(obj, obj2) {
            return obj !== obj2;
        }

        function isIn(obj, arr) {
            if (isArray(arr)) {
                for (var i = 0, l = arr.length; i < l; i++) {
                    if (isEq(obj, arr[i])) {
                        return true;
                    }
                }
            }
            return false;
        }

        function isNotIn(obj, arr) {
            return !isIn(obj, arr);
        }

        function isLt(obj, obj2) {
            return obj < obj2;
        }

        function isLte(obj, obj2) {
            return obj <= obj2;
        }

        function isGt(obj, obj2) {
            return obj > obj2;
        }

        function isGte(obj, obj2) {
            return obj >= obj2;
        }

        function isLike(obj, reg) {
            if (isString(reg)) {
                reg = new RegExp(reg);
            }
            if (isRegExp(reg)) {
                return reg.test("" + obj);
            }
            return false;
        }

        function isNotLike(obj, reg) {
            return !isLike(obj, reg);
        }

        function contains(arr, obj) {
            return isIn(obj, arr);
        }

        function notContains(arr, obj) {
            return !isIn(obj, arr);
        }

        var isa = {
            isFunction: isFunction,
            isObject: isObject,
            isEmpty: isEmpty,
            isHash: isHash,
            isNumber: isNumber,
            isString: isString,
            isDate: isDate,
            isArray: isArray,
            isBoolean: isBoolean,
            isUndefined: isUndefined,
            isDefined: isDefined,
            isUndefinedOrNull: isUndefinedOrNull,
            isNull: isNull,
            isArguments: isArguments,
            instanceOf: isInstanceOf,
            isRegExp: isRegExp,
            deepEqual: deepEqual,
            isTrue: isTrue,
            isFalse: isFalse,
            isNotNull: isNotNull,
            isEq: isEq,
            isNeq: isNeq,
            isSeq: isSeq,
            isSneq: isSneq,
            isIn: isIn,
            isNotIn: isNotIn,
            isLt: isLt,
            isLte: isLte,
            isGt: isGt,
            isGte: isGte,
            isLike: isLike,
            isNotLike: isNotLike,
            contains: contains,
            notContains: notContains
        };

        var tester = {
            constructor: function () {
                this._testers = [];
            },

            noWrap: {
                tester: function () {
                    var testers = this._testers;
                    return function tester(value) {
                        var isa = false;
                        for (var i = 0, l = testers.length; i < l && !isa; i++) {
                            isa = testers[i](value);
                        }
                        return isa;
                    };
                }
            }
        };

        var switcher = {
            constructor: function () {
                this._cases = [];
                this.__default = null;
            },

            def: function (val, fn) {
                this.__default = fn;
            },

            noWrap: {
                switcher: function () {
                    var testers = this._cases, __default = this.__default;
                    return function tester() {
                        var handled = false, args = argsToArray(arguments), caseRet;
                        for (var i = 0, l = testers.length; i < l && !handled; i++) {
                            caseRet = testers[i](args);
                            if (caseRet.length > 1) {
                                if (caseRet[1] || caseRet[0]) {
                                    return caseRet[1];
                                }
                            }
                        }
                        if (!handled && __default) {
                            return  __default.apply(this, args);
                        }
                    };
                }
            }
        };

        function addToTester(func) {
            tester[func] = function isaTester() {
                this._testers.push(isa[func]);
            };
        }

        function addToSwitcher(func) {
            switcher[func] = function isaTester() {
                var args = argsToArray(arguments, 1), isFunc = isa[func], handler, doBreak = true;
                if (args.length <= isFunc.length - 1) {
                    throw new TypeError("A handler must be defined when calling using switch");
                } else {
                    handler = args.pop();
                    if (isBoolean(handler)) {
                        doBreak = handler;
                        handler = args.pop();
                    }
                }
                if (!isFunction(handler)) {
                    throw new TypeError("handler must be defined");
                }
                this._cases.push(function (testArgs) {
                    if (isFunc.apply(isa, testArgs.concat(args))) {
                        return [doBreak, handler.apply(this, testArgs)];
                    }
                    return [false];
                });
            };
        }

        for (var i in isa) {
            if (isa.hasOwnProperty(i)) {
                addToSwitcher(i);
                addToTester(i);
            }
        }

        var is = extended.define(isa).expose(isa);
        is.tester = extended.define(tester);
        is.switcher = extended.define(switcher);
        return is;

    }

    if ("undefined" !== typeof exports) {
        if ("undefined" !== typeof module && module.exports) {
            module.exports = defineIsa(require("extended"));

        }
    } else if ("function" === typeof define) {
        define(["require"], function (require) {
            return defineIsa((require("extended")));
        });
    } else {
        this.is = defineIsa(this.extended);
    }

}).call(this);