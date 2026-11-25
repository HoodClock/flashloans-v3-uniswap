export const { ethers } = require('hardhat');

export async function fixture() {
  const mock = await ethers.deployContract('$EnumerableMap');

  const env = Object.fromEntries(
    MAP_TYPES.map(({ name, key, value }) => [
      name,
      {
        key,
        value,
        keys: Array.from({ length: 3 }, generators[key.type]),
        values: Array.from({ length: 3 }, generators[value.type]),
        zeroValue: generators[value.type].zero,
        methods: mapValues(
          MAP_TYPES.filter(map => map.key.name == key.name).length == 1
            ? {
                set: `$set(uint256,${key.type},${value.type})`,
                get: `$get(uint256,${key.type})`,
                tryGet: `$tryGet(uint256,${key.type})`,
                remove: `$remove(uint256,${key.type})`,
                contains: `$contains(uint256,${key.type})`,
                clear: `$clear_EnumerableMap_${name}(uint256)`,
                length: `$length_EnumerableMap_${name}(uint256)`,
                at: `$at_EnumerableMap_${name}(uint256,uint256)`,
                keys: `$keys_EnumerableMap_${name}(uint256)`,
                keysPage: `$keys_EnumerableMap_${name}(uint256,uint256,uint256)`,
              }
            : {
                set: `$set(uint256,${key.type},${value.type})`,
                get: `$get_EnumerableMap_${name}(uint256,${key.type})`,
                tryGet: `$tryGet_EnumerableMap_${name}(uint256,${key.type})`,
                remove: `$remove_EnumerableMap_${name}(uint256,${key.type})`,
                contains: `$contains_EnumerableMap_${name}(uint256,${key.type})`,
                clear: `$clear_EnumerableMap_${name}(uint256)`,
                length: `$length_EnumerableMap_${name}(uint256)`,
                at: `$at_EnumerableMap_${name}(uint256,uint256)`,
                keys: `$keys_EnumerableMap_${name}(uint256)`,
                keysPage: `$keys_EnumerableMap_${name}(uint256,uint256,uint256)`,
              },
          fnSig =>
            (...args) =>
              mock.getFunction(fnSig)(0, ...args),
        ),
        events: {
          setReturn: `return$set_EnumerableMap_${name}_${key.type}_${value.type}`,
          removeReturn: `return$remove_EnumerableMap_${name}_${key.type}`,
        },
        error: key.memory || value.memory ? `EnumerableMapNonexistent${key.name}Key` : `EnumerableMapNonexistentKey`,
      },
    ]),
  );

  return { mock, env };
}

export const webAuthnSigner = new NonNativeSigner(WebAuthnSigningKey.random());

export const p256Signer = new NonNativeSigner(P256SigningKey.random());
