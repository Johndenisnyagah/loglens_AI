import { useState, useCallback } from 'react';

export interface Profile {
  name:     string;
  initials: string;
  email:    string;
  role:     string;
}

const DEFAULTS: Profile = {
  name:     'Sarah Chen',
  initials: 'SC',
  email:    'sarah.chen@acme.io',
  role:     'Security engineer',
};

const KEY = 'loglens-profile';

function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

export function useProfile() {
  const [profile, setProfileState] = useState<Profile>(load);

  const setProfile = useCallback((next: Profile) => {
    setProfileState(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }, []);

  return { profile, setProfile };
}
