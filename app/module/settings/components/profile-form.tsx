"use client";

import React, { useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../actions';
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import { toast } from 'sonner'; 
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {Label} from "@/components/ui/label";
import {
    Card, 
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";


const ProfileForm = () => {

    const queryClient = useQueryClient();
    const[name, setName] = useState('');
    const[email, setEmail] = useState('');
    
    const {data: profile, isLoading} = useQuery({
        queryKey: ['user-profile'],
        queryFn: getUserProfile,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    // Populate form fields with existing data when profile data is loaded
    useEffect(() => {
        if(profile){
            setName(profile.name || '');
            setEmail(profile.email || '');
        }
    }, [profile]);

    const {mutate: updateProfile} = useMutation(
        {
            mutationFn: async (data: {name: string, email: string}) => {
                return await updateUserProfile(data);
            },
            onSuccess: (data) => {
                if(data.success){
                    toast.success('Profile updated successfully');
                    queryClient.invalidateQueries({queryKey: ['user-profile']});
                } else {
                    toast.error(`Error updating profile: ${data.error}`);
                }
            },
            onError: (error: any) => {
                toast.error(`Error updating profile: ${error.message}`);
            }
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile({name, email});
    };

    if(isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Update your profile information</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="h-10 bg-muted animate-pulse rounded" />
                        <div className="h-10 bg-muted animate-pulse rounded" />
                    </div>
                </CardContent>
            </Card>
        );
    }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                    Save Changes
                </Button>
            </form>
        </CardContent>
    </Card>
  )
}

export default ProfileForm;
