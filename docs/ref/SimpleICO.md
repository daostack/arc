
# *contract* MirrorContractICO is  


## Constructor

*Params:*

 1. **_organization** *of type Avatar*

 2. **_simpleICO** *of type SimpleICO*




## Functions




# *contract* SimpleICO is  


## Constructor

*Params:*

 1. **_nativeToken** *of type StandardToken*

 2. **_fee** *of type uint*

 3. **_beneficiary** *of type address*




## Functions


###  setParameters

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_cap** *of type uint*

 2. **_price** *of type uint*

 3. **_startBlock** *of type uint*

 4. **_endBlock** *of type uint*

 5. **_beneficiary** *of type address*

 6. **_admin** *of type address*




###  getParametersHash

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_cap** *of type uint*

 2. **_price** *of type uint*

 3. **_startBlock** *of type uint*

 4. **_endBlock** *of type uint*

 5. **_beneficiary** *of type address*

 6. **_admin** *of type address*




###  start

*Returns:*


*Params:*

 1. **_avatar** *of type Avatar*




###  haltICO

*Returns:*


*Params:*

 1. **_avatar** *of type address*




###  resumeICO

*Returns:*


*Params:*

 1. **_avatar** *of type address*




### *constant*  isActive

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_avatar** *of type address*




###  donate

*Returns:*

 1. unnamed param *of type uint*


*Params:*

 1. **_avatar** *of type Avatar*

 2. **_beneficiary** *of type address*



