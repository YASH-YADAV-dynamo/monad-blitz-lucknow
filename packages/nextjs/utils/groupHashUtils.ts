import { keccak256, encodePacked } from "viem";

export const calculateGroupHash = (groupName: string, creator: string): `0x${string}` => {
  // This matches the contract's calculation: keccak256(abi.encodePacked(_groupName, msg.sender))
  const encoded = encodePacked(
    ["string", "address"],
    [groupName, creator as `0x${string}`]
  );
  return keccak256(encoded);
};

export const generateGroupHash = (groupName: string, creator: string): `0x${string}` => {
  return calculateGroupHash(groupName, creator);
}; 