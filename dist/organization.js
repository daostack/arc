"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Organization = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils.js');

var _simplecontributionscheme = require('./simplecontributionscheme.js');

var _settings = require('./settings.js');

var _schemeregistrar = require('./schemeregistrar.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dopts = require('default-options');

var Avatar = (0, _utils.requireContract)('Avatar');
var Controller = (0, _utils.requireContract)('Controller');
var DAOToken = (0, _utils.requireContract)("DAOToken");
var GenesisScheme = (0, _utils.requireContract)("GenesisScheme");
var Reputation = (0, _utils.requireContract)("Reputation");
var SimpleICO = (0, _utils.requireContract)("SimpleICO");
// import { GlobalConstraintRegistrar } from   './globalconstraintregistrar.js';
var AbsoluteVote = (0, _utils.requireContract)("AbsoluteVote");

var TokenCapGC = (0, _utils.requireContract)("TokenCapGC");
// import { UpgradeScheme } from   './upgradescheme.js';

var promisify = require('promisify');

// const SCHEME_PERMISSION_REGISTERING = 2;
// const SCHEME_PERMISSION_GLOBALCONSTRAINT = 4;
// const SCHEME_PERMISSION_UPGRADE = 8;
var CONTRACT_SCHEMEREGISTRAR = 'SchemeRegistrar';
var CONTRACT_UPGRADESCHEME = 'UpgradeScheme';
var CONTRACT_GLOBALCONSTRAINTREGISTRAR = 'GlobalConstraintRegistrar';
var CONTRACT_SIMPLECONTRIBUTIONSCHEME = 'SimpleContributionScheme';

var Organization = exports.Organization = function () {
    function Organization() {
        _classCallCheck(this, Organization);
    }

    _createClass(Organization, [{
        key: 'schemes',
        value: async function schemes(contract) {
            // return the schemes registered on this controller satisfying the contract spec
            // return all schems if contract is not given
            var schemes = await this._getSchemes();
            if (contract !== undefined) {
                var result = [];
                for (var i = 0; i < schemes.length; i = i + 1) {
                    if (schemes[i].contract === contract) {
                        result.push(schemes[i]);
                    }
                }
                return result;
            } else {
                return schemes;
            }
        }
    }, {
        key: '_getSchemes',
        value: async function _getSchemes() {
            // private method returns all registered schemes.
            // TODO: this is *expensive*, we need to cache the results (and perhaps poll for latest changes if necessary)
            var result = [];
            var controller = this.controller;
            var settings = await (0, _settings.getSettings)();

            // TODO: only subscribe to registerScheme events that are registering to this.controller.address
            var registerSchemeEvent = controller.RegisterScheme({}, { fromBlock: 0, toBlock: 'latest' });

            var logs = await promisify.cb_func()(function (cb) {
                registerSchemeEvent.get(cb);
            })();
            registerSchemeEvent.stopWatching();

            // get scheme address from the logs
            var addresses = logs.map(function (log) {
                return log.args._scheme;
            });
            var permissions = void 0,
                i = void 0,
                scheme = void 0;

            // we derive the type of scheme from its permissions, which is at most approximate.
            for (i = 0; i < addresses.length; i++) {
                permissions = await controller.getSchemePermissions(addresses[i]);

                scheme = {
                    address: addresses[i],
                    permissions: permissions
                };

                if (parseInt(permissions) === 0) {
                    // contract = 'unregistered' - we ignore it
                    // } else if ((parseInt(permissions) & SCHEME_PERMISSION_REGISTERING) === SCHEME_PERMISSION_REGISTERING) {
                } else if (addresses[i] === String(settings.daostackContracts.SchemeRegistrar.address)) {
                    scheme['contract'] = CONTRACT_SCHEMEREGISTRAR;
                    result.push(scheme);
                    // } else if ((parseInt(permissions) & SCHEME_PERMISSION_UPGRADE) === SCHEME_PERMISSION_UPGRADE) {
                } else if (addresses[i] === String(settings.daostackContracts.UpgradeScheme.address)) {
                    scheme['contract'] = CONTRACT_UPGRADESCHEME;
                    result.push(scheme);
                    // } else if ((parseInt(permissions) & SCHEME_PERMISSION_GLOBALCONSTRAINT) === SCHEME_PERMISSION_GLOBALCONSTRAINT) {
                } else if (addresses[i] === String(settings.daostackContracts.GlobalConstraintRegistrar.address)) {
                    scheme['contract'] = CONTRACT_GLOBALCONSTRAINTREGISTRAR;
                    result.push(scheme);
                } else if (addresses[i] === String(settings.daostackContracts.SimpleContributionScheme.address)) {
                    scheme['contract'] = CONTRACT_SIMPLECONTRIBUTIONSCHEME;
                    result.push(scheme);
                } else {
                    scheme['contract'] = null;
                    result.push(scheme);
                }
            }
            return result;
        }
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
                throw msg;
            }
            return true;
        }
    }, {
        key: 'proposeScheme',
        value: async function proposeScheme() {
            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


            var settings = await (0, _settings.getSettings)();

            var defaults = {
                contract: undefined,
                address: null,
                params: {}
            };

            var options = dopts(opts, defaults);

            var tx = void 0;

            var schemeRegistrar = await this.scheme('SchemeRegistrar');

            if (options.contract === 'SimpleICO') {
                var scheme = await SimpleICO.at(settings.daostackContracts.SimpleICO.address);
                // TODO: check which default params should be required
                var defaultParams = {
                    cap: 0, // uint _cap,
                    price: 0, // uint _price,
                    startBlock: 0, // uint _startBlock,
                    endBlock: 0, // uint _endBlock,
                    beneficiary: _utils.NULL_ADDRESS, // address _beneficiary,
                    admin: _utils.NULL_ADDRESS // address _admin)  returns(bytes32) {
                };
                // tod: all 'null' params are required
                options.params = dopts(options.params, defaultParams);

                // TODO: create the parameters hash on the basis of the options
                await scheme.setParameters(options.params.cap, options.params.price, options.params.startBlock, options.params.endBlock, options.params.beneficiary, options.params.admin);
                var parametersHash = await scheme.getParametersHash(options.params.cap, options.params.price, options.params.startBlock, options.params.endBlock, options.params.beneficiary, options.params.admin);
                var tokenForFee = await scheme.nativeToken();
                var fee = await scheme.fee();
                var autoRegister = false;
                tx = await schemeRegistrar.proposeScheme(this.avatar.address, // Avatar _avatar,
                scheme.address, //address _scheme,
                parametersHash, // bytes32 _parametersHash,
                false, // bool _isRegistering,
                tokenForFee, // StandardToken _tokenFee,
                fee, // uint _fee
                autoRegister // bool _autoRegister
                );
                var proposalId = await (0, _utils.getValueFromLogs)(tx, '_proposalId');
                return proposalId;
            } else if (options.contract === CONTRACT_SIMPLECONTRIBUTIONSCHEME) {
                // get the scheme
                var _defaultParams = {
                    votePrec: 50, // used for SimpleContributionScheme
                    ownerVote: true,
                    intVote: this.votingMachine.address, // used for SimpleContributionScheme
                    orgNativeTokenFee: 0, // used for SimpleContributionScheme
                    schemeNativeTokenFee: 0 // used for SimpleContributionScheme
                };
                // tod: all 'null' params are required
                options.params = dopts(options.params, _defaultParams);

                var _scheme = await _simplecontributionscheme.SimpleContributionScheme.at(options.address || settings.daostackContracts.SimpleContributionScheme.address);
                var votingMachine = AbsoluteVote.at(options.params.intVote);
                // check if voteApporveParams are known on the votingMachine
                await votingMachine.setParameters(this.reputation.address, options.params.votePrec, options.params.ownerVote);
                var voteApproveParams = await votingMachine.getParametersHash(this.reputation.address, options.params.votePrec, options.params.ownerVote);

                // const unpackedParams = await votingMachine.parameters(voteApproveParams);
                // let msg = 'it seems your voteApproveParams are not known on this votingMachine';
                // assert.isOk(unpackedParams[0], msg);

                var _parametersHash = await _scheme.getParametersHash(options.params.orgNativeTokenFee, options.params.schemeNativeTokenFee, voteApproveParams, votingMachine.address);
                await _scheme.setParameters(options.params.orgNativeTokenFee, // uint orgNativeTokenFee; // a fee (in the organization's token) that is to be paid for submitting a contribution
                options.params.schemeNativeTokenFee, // uint schemeNativeTokenFee; // a fee (in the present schemes token)  that is to be paid for submission
                voteApproveParams, // bytes32 voteApproveParams;
                votingMachine.address);

                var feeToken = await _scheme.nativeToken();
                var _fee = await _scheme.fee();
                var _autoRegister = false;

                tx = await schemeRegistrar.proposeScheme(this.avatar.address, // Avatar _avatar,
                _scheme.address, //address _scheme,
                _parametersHash, // bytes32 _parametersHash,
                false, // bool _isRegistering,
                feeToken, // StandardToken _tokenFee,
                _fee, // uint _fee
                _autoRegister // bool _autoRegister
                );
                var _proposalId = await (0, _utils.getValueFromLogs)(tx, '_proposalId');
                return _proposalId;
            } else {
                throw 'Unknown contract';
            }
        }
    }, {
        key: 'proposeGlobalConstraint',
        value: async function proposeGlobalConstraint() {
            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var settings = await (0, _settings.getSettings)();
            var defaults = {
                contract: null,
                address: null,
                params: {},
                paramsHash: null,
                // next three options regard removing a global constraint
                votingMachine: this.votingMachine.address,
                reputation: this.reputation.address,
                absPrecReq: 50
            };

            var options = dopts(opts, defaults);

            if (options.contract === 'TokenCapGC') {
                options.address = options.address || settings.daostackContracts.TokenCapGC.address;
                var tokenCapGC = await TokenCapGC.at(options.address);

                if (options.paramsHash) {
                    // TODO: check if paramsHash is registered
                } else {
                    var defaultParams = {
                        token: null,
                        tokenAddress: this.token.address,
                        cap: 21e9
                    };
                    var params = dopts(options.params, defaultParams);

                    await tokenCapGC.setParameters(params.tokenAddress, params.cap);
                    options.paramsHash = await tokenCapGC.getParametersHash(params.tokenAddress, params.cap);
                }
            } else {
                if (options.address) {
                    //
                } else {
                    var msg = 'Either "contract" or "address" must be provided';
                    throw msg;
                }
            }
            // calculate (and set) the hash that will be used to remove the parameters
            await AbsoluteVote.at(options.votingMachine).setParameters(options.reputation, options.absPrecReq, true);
            options.votingMachineHash = await AbsoluteVote.at(options.votingMachine).getParametersHash(options.reputation, options.absPrecReq, true);

            var globalConstraintRegistrar = await this.scheme('GlobalConstraintRegistrar');
            var tx = await globalConstraintRegistrar.proposeGlobalConstraint(this.avatar.address, options.address, options.paramsHash, options.votingMachineHash);
            var proposalId = (0, _utils.getValueFromLogs)(tx, '_proposalId');
            return proposalId;
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
                    contract: CONTRACT_SCHEMEREGISTRAR,
                    address: settings.daostackContracts.SchemeRegistrar.address
                }, {
                    contract: CONTRACT_UPGRADESCHEME,
                    address: settings.daostackContracts.UpgradeScheme.address
                }, {
                    contract: CONTRACT_GLOBALCONSTRAINTREGISTRAR,
                    address: settings.daostackContracts.GlobalConstraintRegistrar.address
                }]
            };

            var options = dopts(opts, defaults);

            var tx = void 0;

            var genesisScheme = await GenesisScheme.at(options.genesisScheme);

            tx = await genesisScheme.forgeOrg(options.orgName, options.tokenName, options.tokenSymbol, options.founders.map(function (x) {
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


                    var arcSchemeInfo = settings.daostackContracts[optionScheme.contract];
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