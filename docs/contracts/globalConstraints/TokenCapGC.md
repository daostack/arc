# TokenCapGC
[see the generated documentation](../../generated_docs/globalConstraints/TokenCapGC.md)

*TokenCapGC* is a simple global constraint that limits the number of tokens that can be issued.

## Usage

```
TokenCapGC gc = new TokenCapGC();

/* some where inside a scheme with relevent permissions */
bytes32 hash = gc.setParameters(contoller.nativeToken,100) /*limit DAO token issuance to 100*/
controller.addGlobalConstraint(gc,hash)
```
