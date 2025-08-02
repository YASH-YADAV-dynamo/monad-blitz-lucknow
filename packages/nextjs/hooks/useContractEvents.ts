import { useAccount } from "wagmi";
import { useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth/useScaffoldWatchContractEvent";
import { NotificationManager } from "~~/utils/notificationUtils";

export const useContractEvents = () => {
  const { address: connectedAddress } = useAccount();

  // Listen for GroupCreated events
  useScaffoldWatchContractEvent({
    contractName: "PaymentContract",
    eventName: "GroupCreated",
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (log.args.creator?.toLowerCase() === connectedAddress?.toLowerCase() && 
            log.args.groupHash && 
            log.args.groupName && 
            log.args.creator &&
            connectedAddress) {
          NotificationManager.createGroupCreatedNotification(
            connectedAddress,
            log.args.groupHash,
            log.args.groupName,
            log.args.creator
          );
        }
      });
    },
  });

  // Listen for MemberAdded events
  useScaffoldWatchContractEvent({
    contractName: "PaymentContract",
    eventName: "MemberAdded",
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (log.args.member?.toLowerCase() === connectedAddress?.toLowerCase() && 
            log.args.groupHash && 
            log.args.addedBy &&
            connectedAddress) {
          NotificationManager.createGroupCreatedNotification(
            connectedAddress,
            log.args.groupHash,
            "Split Group",
            log.args.addedBy
          );
        }
      });
    },
  });

  // Listen for FundsAdded events
  useScaffoldWatchContractEvent({
    contractName: "PaymentContract",
    eventName: "FundsAdded",
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (log.args.user?.toLowerCase() === connectedAddress?.toLowerCase() && 
            log.args.groupHash && 
            log.args.amount &&
            log.args.user &&
            connectedAddress) {
          NotificationManager.createPaymentReceivedNotification(
            connectedAddress,
            log.args.groupHash,
            log.args.amount.toString(),
            log.args.user
          );
        }
      });
    },
  });

  // Listen for SplitRequestCreated events
  useScaffoldWatchContractEvent({
    contractName: "PaymentContract",
    eventName: "SplitRequestCreated",
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (log.args.to?.toLowerCase() === connectedAddress?.toLowerCase() && 
            log.args.groupHash && 
            log.args.amount &&
            log.args.from &&
            log.args.to &&
            connectedAddress) {
          NotificationManager.createSplitRequestNotification(
            connectedAddress,
            log.args.groupHash,
            log.args.amount.toString(),
            log.args.from,
            "Split Request",
            log.args.amount.toString()
          );
        }
      });
    },
  });
}; 