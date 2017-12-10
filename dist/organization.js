"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Organization = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils.js');

var _settings = require('./settings.js');

var _schemeregistrar = require('./schemeregistrar.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dopts = require('default-options');

var Avatar = (0, _utils.requireContract)('Avatar');
var Controller = (0, _utils.requireContract)('Controller');
var DAOToken = (0, _utils.requireContract)("DAOToken");
var GenesisScheme = (0, _utils.requireContract)("GenesisScheme");
var Reputation = (0, _utils.requireContract)("Reputation");
// import { GlobalConstraintRegistrar } from   './globalconstraintregistrar.js';
var AbsoluteVote = (0, _utils.requireContract)("AbsoluteVote");
// import { UpgradeScheme } from   './upgradescheme.js';

// const SCHEME_PERMISSION_REGISTERING = 2;
// const SCHEME_PERMISSION_GLOBALCONSTRAINT = 4;
// const SCHEME_PERMISSION_UPGRADE = 8;
var CONTRACT_SCHEMEREGISTRAR = 'SchemeRegistrar';
var CONTRACT_UPGRADESCHEME = 'UpgradeScheme';
var CONTRACT_GLOBALCONSTRAINTREGISTRAR = 'GlobalConstraintRegistrar';
// const CONTRACT_SIMPLECONTRIBUTIONSCHEME = 'SimpleContributionScheme';

var Organization = exports.Organization = function () {
    function Organization() {
        _classCallCheck(this, Organization);
    }

    _createClass(Organization, [{
        key: 'schemes',


        /**
         * returns 
         * @param name linke "SchemeRegistrar" 
         */
        value: async function schemes(name) {
            // return the schemes registered on this controller satisfying the contract spec
            // return all schems if contract is not given
            var schemes = await this._getSchemes();
            if (name) {
                return schemes.filter(function (s) {
                    return s.name === name;
                });
            } else {
                return schemes;
            }
        }

        /**
         * returns schemes currently in this Organization as Array<OrganizationSchemeInfo>
         */

    }, {
        key: '_getSchemes',
        value: async function _getSchemes() {
            var _this = this;

            // private method returns all registered schemes.
            // TODO: this is *expensive*, we need to cache the results (and perhaps poll for latest changes if necessary)
            var schemesMap = new Map(); // <string, { address: string, permissions: string, name: string }>
            var controller = this.controller;
            var arcTypesMap = new Map(); // <address: string, name: string>
            var settings = await (0, _settings.getSettings)();

            /**
             * TODO:  This should pull in all known versions of the schemes, names 
             * and versions in one fell swoop.
             */
            for (var name in settings.daostackContracts) {
                var contract = settings.daostackContracts[name];
                arcTypesMap.set(contract.address, name);
            }

            var registerSchemeEvent = controller.RegisterScheme({}, { fromBlock: 0, toBlock: 'latest' });

            await new Promise(function (resolve) {
                registerSchemeEvent.get(function (err, eventsArray) {
                    return _this._handleSchemeEvent(err, eventsArray, true, arcTypesMap, schemesMap).then(function () {
                        resolve();
                    });
                });
                registerSchemeEvent.stopWatching();
            });

            var unRegisterSchemeEvent = controller.UnregisterScheme({}, { fromBlock: 0, toBlock: 'latest' });

            await new Promise(function (resolve) {
                unRegisterSchemeEvent.get(function (err, eventsArray) {
                    return _this._handleSchemeEvent(err, eventsArray, false, arcTypesMap, schemesMap).then(function () {
                        resolve();
                    });
                });
                unRegisterSchemeEvent.stopWatching();
            });

            return Array.from(schemesMap.values());
        }
    }, {
        key: '_handleSchemeEvent',
        value: async function _handleSchemeEvent(err, eventsArray, adding, arcTypesMap, schemesMap) // : Promise<void>
        {
            if (!(eventsArray instanceof Array)) {
                eventsArray = [eventsArray];
            }
            var count = eventsArray.length;
            for (var i = 0; i < count; i++) {
                var schemeAddress = eventsArray[i].args._scheme;
                // will be all zeros if not registered
                var permissions = await this.controller.getSchemePermissions(schemeAddress);

                var schemeInfo = {
                    address: schemeAddress,
                    permissions: permissions,
                    // will be undefined if not a known scheme
                    name: arcTypesMap.get(schemeAddress)
                };

                if (adding) {
                    schemesMap.set(schemeAddress, schemeInfo);
                } else if (schemesMap.has(schemeAddress)) {
                    schemesMap.delete(schemeAddress);
                }
            }
        }

        /**
         * Returns promise of a scheme as ExtendTruffleScheme, or ? if not found
         * @param contract name of scheme, like "SchemeRegistrar" 
         */

    }, {
        key: 'scheme',
        value: async function scheme(contract) {
            // returns the schemes can be used to register other schemes
            // TODO: error handling: throw an error if such a schem does not exist, and also if there is more htan one
            var settings = await (0, _settings.getSettings)();
            var contractInfo = settings.daostackContracts[contract];
            // check if indeed the registrar is registered as a scheme on  the controller
            // const isSchemeRegistered = await this.controller.isSchemeRegistered(contractInfo.address);
            // assert.equal(isSchemeRegistered, true, `${contract} is not registered with the controller`);

            return contractInfo.contract.at(contractInfo.address);
        }
    }, {
        key: 'checkSchemeConditions',
        value: async function checkSchemeConditions(scheme) {
            // check if the scheme if ready for usage - i.e. if the org is registered at the scheme and vice versa
            // check if the schems is usable
            // const controller = this.controller;
            var avatar = this.avatar;

            // check if indeed the registrar is registered as a scheme on  the controller
            // const isSchemeRegistered = await controller.isSchemeRegistered(scheme.address);
            // assert.equal(isSchemeRegistered, true, `${contract} is not registered with the controller`);

            // check if the controller is registered (has paid the fee)
            var isControllerRegistered = await scheme.isRegistered(avatar.address);
            if (!isControllerRegistered) {
                var msg = 'The organization is not registered on this schme: ' + contract + '; ' + contractInfo.address;
                throw new Error(msg);
            }
            return true;
        }
    }, {
        key: 'vote',
        value: function vote(proposalId, choice, params) {
            // vote for the proposal given by proposalId using this.votingMachine
            // NB: this will not work for proposals using votingMachine's that are not the default one
            return this.votingMachine.vote(proposalId, choice, params);
        }
    }], [{
        key: 'new',
        value: async function _new(opts) {
            // TODO: optimization: we now have all sequantial awaits: parallelize them if possible
            // TODO: estimate gas/ether needed based on given options, check balance of sender, and
            // warn if necessary.
            // TODO: default options need to be extended), cf. https://github.com/daostack/daostack/issues/43
            // TODO: orgName, tokenName and tokenSymbol should be required - implement this
            // QUESTION: should we add options to deploy with existing tokens or rep?
            var settings = await (0, _settings.getSettings)();

            var defaults = {
                orgName: null,
                tokenName: null,
                tokenSymbol: null,
                founders: [],
                votingMachine: settings.daostackContracts.AbsoluteVote.address,
                votePrec: 50,
                ownerVote: true,
                orgNativeTokenFee: 0, // used for SimpleContributionScheme
                schemeNativeTokenFee: 0, // used for SimpleContributionScheme
                genesisScheme: settings.daostackContracts.GenesisScheme.address,
                schemes: [{
                    name: CONTRACT_SCHEMEREGISTRAR,
                    address: settings.daostackContracts.SchemeRegistrar.address
                }, {
                    name: CONTRACT_UPGRADESCHEME,
                    address: settings.daostackContracts.UpgradeScheme.address
                }, {
                    name: CONTRACT_GLOBALCONSTRAINTREGISTRAR,
                    address: settings.daostackContracts.GlobalConstraintRegistrar.address
                }]
            };

            var options = dopts(opts, defaults, { allowUnknown: true });
            var genesisScheme = await GenesisScheme.at(options.genesisScheme);

            var tx = await genesisScheme.forgeOrg(options.orgName, options.tokenName, options.tokenSymbol, options.founders.map(function (x) {
                return x.address;
            }), options.founders.map(function (x) {
                return x.tokens;
            }), options.founders.map(function (x) {
                return x.reputation;
            }));
            // get the address of the avatar from the logs
            var avatarAddress = (0, _utils.getValueFromLogs)(tx, '_avatar');
            var org = new Organization();

            options.avatar = avatarAddress;
            org.avatar = await Avatar.at(options.avatar);
            var controllerAddress = await org.avatar.owner();
            org.controller = await Controller.at(controllerAddress);

            var tokenAddress = await org.controller.nativeToken();
            org.token = await DAOToken.at(tokenAddress);

            var reputationAddress = await org.controller.nativeReputation();
            org.reputation = await Reputation.at(reputationAddress);

            org.votingMachine = await AbsoluteVote.at(options.votingMachine);
            await org.votingMachine.setParameters(org.reputation.address, options.votePrec, options.ownerVote);

            var voteParametersHash = await org.votingMachine.getParametersHash(org.reputation.address, options.votePrec, options.ownerVote);

            // TODO: these are specific configuration options that should be settable in the options above
            var initialSchemesAddresses = [];
            var initialSchemesParams = [];
            var initialSchemesTokenAddresses = [];
            var initialSchemesFees = [];
            var initialSchemesPermissions = [];

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = options.schemes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var optionScheme = _step.value;


                    var arcSchemeInfo = settings.daostackContracts[optionScheme.name];
                    var scheme = await arcSchemeInfo.contract.at(optionScheme.address || arcSchemeInfo.address);

                    var paramsHash = await scheme.setParams({
                        voteParametersHash: voteParametersHash,
                        votingMachine: org.votingMachine.address,
                        orgNativeTokenFee: options.orgNativeTokenFee,
                        schemeNativeTokenFee: options.schemeNativeTokenFee
                    });

                    initialSchemesAddresses.push(scheme.address);
                    initialSchemesParams.push(paramsHash);
                    initialSchemesTokenAddresses.push((await scheme.nativeToken()));
                    initialSchemesFees.push((await scheme.fee()));
                    initialSchemesPermissions.push(scheme.getDefaultPermissions() /* supply options.permissions here? */);
                }

                // register the schemes with the organization
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            await genesisScheme.setInitialSchemes(org.avatar.address, initialSchemesAddresses, initialSchemesParams, initialSchemesTokenAddresses, initialSchemesFees, initialSchemesPermissions);

            // transfer what we need for fees to register the organization at the given schemes
            // TODO: check if we have the funds, if not, throw an exception
            // fee = await org.schemeRegistrar.fee())
            // we must do this after setInitialSchemes, because that one approves the transactions
            // (but that logic shoudl change)
            var token = void 0,
                fee = void 0;
            for (var i = 0; i < initialSchemesAddresses.length; i = i + 1) {
                scheme = await _schemeregistrar.SchemeRegistrar.at(initialSchemesAddresses[i]);
                token = await DAOToken.at(initialSchemesTokenAddresses[i]);
                fee = initialSchemesFees[i];
                await token.transfer(org.avatar.address, fee);
                await scheme.registerOrganization(org.avatar.address);
            }

            return org;
        }
    }, {
        key: 'at',
        value: async function at(avatarAddress) {
            var org = new Organization();

            org.avatar = await Avatar.at(avatarAddress);
            var controllerAddress = await org.avatar.owner();
            org.controller = await Controller.at(controllerAddress);

            var tokenAddress = await org.controller.nativeToken();
            org.token = await DAOToken.at(tokenAddress);

            var reputationAddress = await org.controller.nativeReputation();
            org.reputation = await Reputation.at(reputationAddress);

            // TODO: we now just set the default voting machine, and assume it is used
            // throughout, but this assumption is not warranted
            var settings = await (0, _settings.getSettings)();
            if (settings.votingMachine) {
                org.votingMachine = AbsoluteVote.at(settings.votingMachine);
            }

            return org;
        }
    }]);

    return Organization;
}();