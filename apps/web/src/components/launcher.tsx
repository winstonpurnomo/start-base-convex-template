import {
  formatForDisplay,
  formatHotkeySequence,
  HotkeyManager,
  SequenceManager,
  useHotkey,
} from "@tanstack/react-hotkeys";
import type {
  HotkeyRegistrationHandle,
  HotkeySequence,
  RegisterableHotkey,
  SequenceRegistrationHandle,
} from "@tanstack/react-hotkeys";
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@workspace/ui/components/command";
import { Kbd } from "@workspace/ui/components/kbd";
import { Spinner } from "@workspace/ui/components/spinner";
import { ArrowRightCircleIcon, ArrowRightIcon, LogOutIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

import { authClient } from "@/lib/auth";

import { useLauncherContext } from "./launcher-context";

export interface ActionItem {
  label: string;
  // oxlint-disable-next-line typescript/no-explicit-any
  icon: React.ForwardRefExoticComponent<any>;
  action: () => void | Promise<void>;
  hotkey?: RegisterableHotkey | HotkeySequence;
}

export interface ActionGroup {
  groupLabel: string;
  items: ActionItem[];
}

function useGlobalActions(): ActionGroup[] {
  const navigate = useNavigate();
  const router = useRouter();
  const location = useLocation();
  return [
    {
      groupLabel: "Navigation",
      items: [
        {
          label: "Go to Home",
          icon: ArrowRightCircleIcon,
          action: async () => {
            await navigate({ to: "/app" });
          },
          hotkey: ["O", "H"],
        },
        {
          label: "Go to Settings",
          icon: ArrowRightCircleIcon,
          action: async () => {
            await navigate({
              to: "/app/settings",
              search: { rt: location.pathname },
            });
          },
          hotkey: ["O", "S"],
        },
      ],
    },
    {
      groupLabel: "Account",
      items: [
        {
          label: "Log out",
          icon: LogOutIcon,
          action: async () => {
            await authClient.signOut();
            await navigate({ to: "/" });
            await router.invalidate();
          },
          hotkey: "Mod+Shift+Q",
        },
      ],
    },
  ];
}

export function Launcher() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const { localCommandGroups } = useLauncherContext();

  useHotkey("Mod+K", () => {
    setOpen((o) => !o);
  });

  const globalActions = useGlobalActions();
  const allGroups = [...globalActions, ...localCommandGroups];

  const manager = HotkeyManager.getInstance();
  const sequenceManager = SequenceManager.getInstance();

  useEffect(() => {
    const registrations: (
      | HotkeyRegistrationHandle
      | SequenceRegistrationHandle
    )[] = [];
    for (const item of globalActions.flatMap((g) => g.items)) {
      if (item.hotkey) {
        registrations.push(
          Array.isArray(item.hotkey)
            ? sequenceManager.register(item.hotkey, item.action)
            : manager.register(item.hotkey, item.action)
        );
      }
    }
    return () => {
      for (const reg of registrations) {
        reg.unregister();
      }
    };
    // globalActions is stable per-render but the actions close over navigate/router
    // which are stable refs, so exhaustive-deps would be noise here
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [manager, sequenceManager]);

  useEffect(() => {
    const registrations: (
      | HotkeyRegistrationHandle
      | SequenceRegistrationHandle
    )[] = [];
    for (const item of localCommandGroups.flatMap((g) => g.items)) {
      if (item.hotkey) {
        registrations.push(
          Array.isArray(item.hotkey)
            ? sequenceManager.register(item.hotkey, item.action)
            : manager.register(item.hotkey, item.action)
        );
      }
    }
    return () => {
      for (const reg of registrations) {
        reg.unregister();
      }
    };
  }, [localCommandGroups, manager, sequenceManager]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Search or do something" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {allGroups.map((g) => (
            <CommandGroup heading={g.groupLabel} key={g.groupLabel}>
              {g.items.map(({ label, icon: Icon, action, hotkey }) => (
                <CommandItem
                  key={label}
                  disabled={pending}
                  onSelect={async () => {
                    setPending(true);
                    await action();
                    setOpen(false);
                    setPending(false);
                  }}
                >
                  {pending ? <Spinner /> : <Icon />}
                  <span>{label}</span>
                  {hotkey && (
                    <CommandShortcut>
                      {Array.isArray(hotkey) ? (
                        <div className="flex items-center space-x-0.5">
                          {formatHotkeySequence(hotkey)
                            .split(" ")
                            .map((step, i, arr) => (
                              <Fragment key={step}>
                                <Kbd>{step}</Kbd>
                                {i < arr.length - 1 && (
                                  <ArrowRightIcon className="size-3" />
                                )}
                              </Fragment>
                            ))}
                        </div>
                      ) : (
                        <Kbd>{formatForDisplay(hotkey)}</Kbd>
                      )}
                    </CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
