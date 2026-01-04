"use client";

import React from "react";
import ProfileForm from "@/app/module/settings/components/profile-form";
import ConnectedRepositoryList from "@/app/module/settings/components/connected-repo-list";

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and connected repositories
        </p>
      </div>
      <ProfileForm />
      <ConnectedRepositoryList />
    </div>
  );
};

export default SettingsPage;
