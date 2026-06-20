'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore, type UserInfo } from '@/lib/store';
import { API_BASE } from '@/lib/api';
import { Pencil, Check, Loader2, Github, Link2, Unlink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useI18n, type Translations } from '@/lib/i18n';

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function useGithubConfig(user: UserInfo | null) {
  const [githubConfigEnabled, setGithubConfigEnabled] = useState(false);

  const fetchGithubStatus = useCallback(async () => {
    if (!user) {return;}
    try {
      const res = await fetch(`${API_BASE}/api/auth/github/config`);
      if (res.ok) {
        const data = await res.json();
        setGithubConfigEnabled(data.enabled === true);
      }
    } catch {
      // Ignore
    }
  }, [user]);

  return { githubConfigEnabled, fetchGithubStatus };
}

function NameSection({
  user,
  editingName,
  nameValue,
  nameLoading,
  onEditStart,
  onSave,
  onNameChange,
  t,
}: {
  user: UserInfo;
  editingName: boolean;
  nameValue: string;
  nameLoading: boolean;
  onEditStart: () => void;
  onSave: () => void;
  onNameChange: (v: string) => void;
  t: Translations;
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-3">{t.profile.personalInfo}</h3>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-emerald-500/20 shrink-0">
          {(user.name || user.email)?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameValue}
                onChange={(e) => onNameChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSave()}
                className="h-8 text-sm"
                autoFocus
              />
              <Button
                size="sm"
                onClick={onSave}
                disabled={nameLoading}
                className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
              >
                {nameLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                {user.name || t.profile.noNickname}
              </span>
              <button
                onClick={onEditStart}
                className="h-6 w-6 rounded-md flex items-center justify-center text-neutral-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors shrink-0"
                title={t.profile.changeNickname}
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}
          <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">{user.email}</p>
        </div>
      </div>
    </section>
  );
}

function GithubSection({
  githubConfigEnabled,
  githubBound,
  githubLoading,
  t,
}: {
  githubConfigEnabled: boolean;
  githubBound: boolean;
  githubLoading: boolean;
  t: Translations;
}) {
  if (!githubConfigEnabled) {
    return (
      <section>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-3">{t.profile.thirdPartyLogin}</h3>
        <div className="py-4 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            {t.profile.noThirdParty}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-3">{t.profile.thirdPartyLogin}</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-800/40 bg-white dark:bg-neutral-800/30">
          <div className="flex items-center gap-2.5">
            <Github className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <div>
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">GitHub</span>
            </div>
          </div>
          {githubBound ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <Link2 className="w-2.5 h-2.5" />
              {t.profile.bound}
            </span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.location.href = `${API_BASE}/api/auth/github`;
              }}
              disabled={githubLoading}
              className="h-7 text-xs text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
            >
              {githubLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {t.profile.bind}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function DangerSection({
  deleteConfirming,
  deleteLoading,
  onConfirm,
  onCancel,
  t,
}: {
  deleteConfirming: boolean;
  deleteLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  t: Translations;
}) {
  if (deleteConfirming) {
    return (
      <section>
        <h3 className="text-sm font-semibold text-red-500 dark:text-red-400 mb-3">{t.profile.dangerZone}</h3>
        <div className="p-3 rounded-xl border-2 border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20 space-y-3">
          <p className="text-xs text-red-600 dark:text-red-400">
            {t.profile.deleteWarning}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={onConfirm}
              disabled={deleteLoading}
              className="h-8 text-xs"
            >
              {deleteLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              {t.profile.deleteConfirm}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 text-xs text-neutral-500"
            >
              {t.common.cancel}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h3 className="text-sm font-semibold text-red-500 dark:text-red-400 mb-3">{t.profile.dangerZone}</h3>
      <Button
        variant="ghost"
        onClick={onConfirm}
        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-9 text-xs"
      >
        <Unlink className="w-3.5 h-3.5 mr-2" />
        {t.profile.deleteAccount}
      </Button>
    </section>
  );
}

/* eslint-disable max-lines-per-function */
export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
  const { user, setUser } = useAppStore();
  const { t } = useI18n();
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  const [githubBound, setGithubBound] = useState(false);
  const [_githubUsername] = useState<string | null>(null);
  const [_githubLoading] = useState(false);

  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { githubConfigEnabled, fetchGithubStatus } = useGithubConfig(user);

  // Use a ref to track the previous open state to initialize state only on dialog open
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (open && !prevOpenRef.current && user) {
      setNameValue(user.name || '');
      setEditingName(false);
      setDeleteConfirming(false);
      setGithubBound(!!((user as unknown) as Record<string, unknown>).githubId);
      fetchGithubStatus();
    }
    prevOpenRef.current = open;
  }, [open, user, fetchGithubStatus]);

  const handleSaveName = async () => {
    if (!user) {return;}
    const newName = nameValue.trim();
    if (!newName) {
      toast({ title: t.profile.nicknameRequired, variant: 'destructive' });
      return;
    }
    setNameLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, name: newName }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast({ title: data.error || t.profile.updateFailed, variant: 'destructive' });
        return;
      }
      const data = await res.json();
      setUser(data as UserInfo);
      setEditingName(false);
      toast({ title: t.profile.nicknameUpdated });
    } catch {
      toast({ title: t.common.networkError, variant: 'destructive' });
    } finally {
      setNameLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) {return;}
    if (!deleteConfirming) {
      setDeleteConfirming(true);
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast({ title: data.error || t.profile.deleteFailed, variant: 'destructive' });
        return;
      }
      toast({ title: t.profile.accountDeleted });
      const { logout } = useAppStore.getState();
      logout();
      onOpenChange(false);
    } catch {
      toast({ title: t.common.networkError, variant: 'destructive' });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) {return null;}

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setDeleteConfirming(false); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.profile.title}</DialogTitle>
          <DialogDescription>{t.profile.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <NameSection
            user={user}
            editingName={editingName}
            nameValue={nameValue}
            nameLoading={nameLoading}
            onEditStart={() => setEditingName(true)}
            onSave={handleSaveName}
            onNameChange={setNameValue}
            t={t}
          />

          <GithubSection
            githubConfigEnabled={githubConfigEnabled}
            githubBound={githubBound}
            githubLoading={_githubLoading}
            t={t}
          />

          <DangerSection
            deleteConfirming={deleteConfirming}
            deleteLoading={deleteLoading}
            onConfirm={handleDeleteAccount}
            onCancel={() => setDeleteConfirming(false)}
            t={t}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}