import { useState, useEffect, useCallback } from 'react';
import { api } from '../shared/api';
import type {
  Profile,
  ProfileType,
  Experience,
  Education,
  Project,
  Certification,
  Document,
} from '../shared/types';

export function useProfile() {
  const [masterProfile, setMasterProfile] = useState<Profile | null>(null);
  const [jobProfile, setJobProfile] = useState<Profile | null>(null);
  const [freelanceProfile, setFreelanceProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [profiles, exps, edu, projs, certs, docs] = await Promise.all([
        api.getProfiles(),
        api.getExperiences(),
        api.getEducation(),
        api.getProjects(),
        api.getCertifications(),
        api.getDocuments(),
      ]);

      profiles.forEach((p) => {
        if (p.type === 'master') setMasterProfile(p);
        else if (p.type === 'job') setJobProfile(p);
        else if (p.type === 'freelance') setFreelanceProfile(p);
      });

      setExperiences(exps);
      setEducation(edu);
      setProjects(projs);
      setCertifications(certs);
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refresh = useCallback(() => fetchAll(), [fetchAll]);

  const getProfile = (type: ProfileType): Profile | null => {
    switch (type) {
      case 'master':
        return masterProfile;
      case 'job':
        return jobProfile;
      case 'freelance':
        return freelanceProfile;
    }
  };

  const updateProfile = async (type: ProfileType, data: Partial<Profile>) => {
    const updated = await api.updateProfile(type, data);
    if (type === 'master') setMasterProfile(updated);
    else if (type === 'job') setJobProfile(updated);
    else if (type === 'freelance') setFreelanceProfile(updated);
    return updated;
  };

  const createProfile = async (data: Partial<Profile>) => {
    const created = await api.createProfile(data);
    if (created.type === 'master') setMasterProfile(created);
    else if (created.type === 'job') setJobProfile(created);
    else if (created.type === 'freelance') setFreelanceProfile(created);
    return created;
  };

  const uploadDocument = async (file: File, isCv: boolean = false) => {
    const uploaded = await api.uploadDocument(file, isCv);
    setDocuments((prev) => [uploaded, ...prev]);
    return uploaded;
  };

  const deleteDocument = async (id: number) => {
    await api.deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return {
    masterProfile,
    jobProfile,
    freelanceProfile,
    getProfile,
    experiences,
    education,
    projects,
    certifications,
    documents,
    isLoading,
    error,
    refresh,
    updateProfile,
    createProfile,
    uploadDocument,
    deleteDocument,
    setExperiences,
    setEducation,
    setProjects,
    setCertifications,
    setDocuments,
  };
}
