pragma solidity ^0.4.18;

import "../universalSchemes/UniversalScheme.sol";


contract UniversalSchemeMock is UniversalScheme {

    struct Parameters {
       bytes32 a;
       bytes32 b;
       bytes32 c;
       bytes32 d;
       bytes32 e;
       bytes32 f;
       bytes32 g;
       bytes32 h;
    }

    mapping(bytes32=>Parameters) public parameters;

    function UniversalSchemeMock() public {}

    function setParameters(
      bytes32 a,
      bytes32 b,
      bytes32 c,
      bytes32 d,
      bytes32 e,
      bytes32 f,
      bytes32 g,
      bytes32 h
    ) public returns(bytes32)
    {
        bytes32 paramsHash = getParametersHash(a,b,c,d,e,f,g,h);

        parameters[paramsHash].a = a;
        parameters[paramsHash].b = b;
        parameters[paramsHash].c = c;
        parameters[paramsHash].d = d;
        parameters[paramsHash].e = e;
        parameters[paramsHash].f = f;
        parameters[paramsHash].g = g;
        parameters[paramsHash].h = h;
        return paramsHash;
    }

    function getParametersHash(
      bytes32 a,
      bytes32 b,
      bytes32 c,
      bytes32 d,
      bytes32 e,
      bytes32 f,
      bytes32 g,
      bytes32 h
    ) public pure returns(bytes32)
    {
        return keccak256(a,b,c,d,e,f,g,h);
    }
}
