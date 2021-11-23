import { MnemonicKey, PublicKey, RawKey } from '@terra-money/terra.js';
import { randomBytes } from 'crypto';
import jscrypto from 'jscrypto';
import secp256k1 from 'secp256k1';

describe.skip('sign-bytes', () => {
  test('basic secp256k1 ecdsaSign', () => {
    // create key
    const privateKey = randomBytes(32);
    const publicKey = secp256k1.publicKeyCreate(privateKey);

    // create message - message must be a 32-length Uint8Array
    const bytes = Buffer.from('hello world');
    const message = Buffer.from(
      jscrypto.SHA256.hash(new jscrypto.Word32Array(bytes)).toString(),
      'hex',
    );

    // ecdsaSign
    const { signature } = secp256k1.ecdsaSign(message, privateKey);

    // verify
    expect(secp256k1.ecdsaVerify(signature, message, publicKey)).toBeTruthy();

    expect(
      secp256k1.ecdsaVerify(
        signature,
        Buffer.from(
          jscrypto.SHA256.hash(
            new jscrypto.Word32Array(Buffer.from('hello world')),
          ).toString(),
          'hex',
        ),
        publicKey,
      ),
    ).toBeTruthy();
  });

  test('terra.js secp256k1 ecdsaSign', () => {
    // create key (same as extension wallet creation)
    const mk = new MnemonicKey({ coinType: 330 });
    const privateKey = mk.privateKey.toString('hex');
    const key = new RawKey(Buffer.from(privateKey, 'hex'));

    // create message
    const bytes = Buffer.from('hello world');

    // ecdsaSign - this function transform the bytes to
    //     message = Uint8Array.from(
    //                  Buffer.from(
    //                      jscrypto.SHA256.hash(
    //                          new jscrypto.Word32Array(bytes)
    //                      ).toString(),
    //                  'hex')
    //               )
    const { signature, recid } = key.ecdsaSign(bytes);

    // return sign-bytes result to user
    const userReturn = {
      recid,
      signature,
      public_key: key.publicKey?.toData(),
    };

    //@ts-ignore
    const publicKey = PublicKey.fromData(userReturn.public_key!).toProto().key;

    //publicKey: Buffer.from(publicKey.key).toString('base64'),

    // verify by userReturn data
    expect(
      secp256k1.ecdsaVerify(
        userReturn.signature,
        Buffer.from(
          jscrypto.SHA256.hash(new jscrypto.Word32Array(bytes)).toString(),
          'hex',
        ),
        Buffer.from(publicKey, 'base64'),
      ),
    ).toBeTruthy();
  });
});
