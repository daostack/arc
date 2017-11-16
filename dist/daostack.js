'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Organization = exports.daostack = undefined;

var _organization = require('./organization.js');

/**
 * DEPRECATED.  See arc.js
 * DAOStack library
 *
 */
// TODO: documentation!

var daostack = function () {

    // async function _checkForNecessaryFunds() {
    //   // TODO: this is not working at all yet: the idea is that we check some precodnitions
    //   // to be able to give some useful user feedback
    //   return true;
    //
    //   // check if we have tokens in the schemeregistrar for adding an organization
    //   const schemeRegistrarTokenAddress = await schemeRegistrar.nativeToken();
    //   const schemeRegistrarToken = await DAOToken.at(schemeRegistrarTokenAddress);
    //   const avatarBalance = await schemeRegistrarToken.balanceOf(avatar.address);
    //   const fee = await schemeRegistrar.fee();
    //
    //   // check if we have the funds to pay the fee
    //   if (avatarBalance.toNumber() < fee.toNumber()) {
    //     throw new Error('The balance of the controller\'s avatar is too low to pay the fee for adding an organization. Balance: ' +  ourBalance.valueOf() + 'fee: '  + fee);
    //   }
    //
    //   const beneficiary = await schemeRegistrar.beneficiary();
    //   await controller.ExternalTokenApprove(schemeRegistrarToken, beneficiary, fee.toNumber());
    //   // check if externaltokenapprove has indeed approved the right allowance
    //   // TODO: move this to a separate test on the controller
    //   const allowance = await schemeRegistrarToken.allowance(avatar.address, beneficiary);
    //   if (allowance.toNumber() < fee.toNumber()) {
    //     throw new Error('The allowance of the controllers avatar to the registrars beneficiary is too low to pay the fee for adding an organization. Balance: ' +  ourBalance.valueOf() + 'fee: '  + fee);
    //   }
    // }

    return {};
}();

exports.daostack = daostack;
exports.Organization = _organization.Organization;