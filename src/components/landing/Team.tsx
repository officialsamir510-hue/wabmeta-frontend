// src/components/landing/Team.tsx
import React from 'react';
import { Linkedin, Twitter, Mail, Github, Award, Code, Briefcase } from 'lucide-react';

interface TeamMember {
    name: string;
    role: string;
    title: string;
    image: string;
    description: string;
    skills: string[];
    social: {
        linkedin?: string;
        twitter?: string;
        github?: string;
        email?: string;
    };
    icon: React.ElementType;
    gradient: string;
}

const teamMembers: TeamMember[] = [
    {
        name: 'Ankit Verma',
        role: 'CEO & Founder',
        title: 'Chief Executive Officer',
        image: 'https://ui-avatars.com/api/?name=Ankit+Verma&size=256&background=0D9488&color=fff&bold=true&format=svg',
        description: 'Visionary entrepreneur with 8+ years of experience in tech industry. Leading WabMeta to revolutionize WhatsApp Business communication for enterprises worldwide.',
        skills: ['Business Strategy', 'Product Vision', 'Team Leadership', 'Growth Hacking'],
        social: {
            linkedin: 'https://linkedin.com/in/ankitverma',
            twitter: 'https://twitter.com/ankitverma',
            email: 'ankit@wabmeta.com'
        },
        icon: Briefcase,
        gradient: 'from-teal-500 to-emerald-600'
    },
    {
        name: 'Samir Thakur',
        role: 'Lead Developer',
        title: 'Full Stack Developer',
        image: 'https://ui-avatars.com/api/?name=Samir+Thakur&size=256&background=7C3AED&color=fff&bold=true&format=svg',
        description: 'Passionate full-stack developer specializing in React, Node.js, and cloud architecture. Building scalable solutions that power thousands of businesses.',
        skills: ['React/TypeScript', 'Node.js', 'System Design', 'WhatsApp API'],
        social: {
            linkedin: 'https://linkedin.com/in/samirthakur',
            github: 'https://github.com/samirthakur',
            email: 'samir@wabmeta.com'
        },
        icon: Code,
        gradient: 'from-violet-500 to-purple-600'
    }
];

const Team: React.FC = () => {
    return (
        <section id="team" className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="text-center mb-16 lg:mb-20">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mb-4">
                        <Award className="w-4 h-4 mr-2" />
                        Our Leadership
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                        Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">Minds</span> Behind WabMeta
                    </h2>
                    <p className="mt-4 max-w-2xl text-lg lg:text-xl text-gray-600 dark:text-gray-300 mx-auto">
                        A dedicated team of innovators committed to transforming how businesses communicate on WhatsApp.
                    </p>
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
                    {teamMembers.map((member, index) => (
                        <div
                            key={index}
                            className="group relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700"
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                            {/* Card Content */}
                            <div className="relative p-6 lg:p-8">

                                {/* Top Section - Image & Basic Info */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">

                                    {/* Profile Image */}
                                    <div className="relative flex-shrink-0">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity`}></div>
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="relative w-28 h-28 lg:w-32 lg:h-32 rounded-2xl object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                                        />
                                        {/* Role Badge */}
                                        <div className={`absolute -bottom-2 -right-2 bg-gradient-to-r ${member.gradient} p-2 rounded-xl shadow-lg`}>
                                            <member.icon className="w-5 h-5 text-white" />
                                        </div>
                                    </div>

                                    {/* Name & Title */}
                                    <div className="text-center sm:text-left flex-1">
                                        <h3 className="text-2xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                            {member.name}
                                        </h3>
                                        <p className={`text-transparent bg-clip-text bg-gradient-to-r ${member.gradient} font-semibold text-lg mb-2`}>
                                            {member.role}
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            {member.title}
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-center sm:text-left">
                                    {member.description}
                                </p>

                                {/* Skills */}
                                <div className="mb-6">
                                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                        {member.skills.map((skill, skillIndex) => (
                                            <span
                                                key={skillIndex}
                                                className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="flex justify-center sm:justify-start gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    {member.social.linkedin && (
                                        <a
                                            href={member.social.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                                        >
                                            <Linkedin className="w-5 h-5" />
                                        </a>
                                    )}
                                    {member.social.twitter && (
                                        <a
                                            href={member.social.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-500 dark:hover:text-sky-400 transition-all duration-300"
                                        >
                                            <Twitter className="w-5 h-5" />
                                        </a>
                                    )}
                                    {member.social.github && (
                                        <a
                                            href={member.social.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
                                        >
                                            <Github className="w-5 h-5" />
                                        </a>
                                    )}
                                    {member.social.email && (
                                        <a
                                            href={`mailto:${member.social.email}`}
                                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-all duration-300"
                                        >
                                            <Mail className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Join Team CTA */}
                <div className="mt-16 lg:mt-20 text-center">
                    <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 lg:p-8 border border-green-100 dark:border-green-800">
                        <div className="text-center sm:text-left">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                Want to join our team?
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                We're always looking for talented individuals
                            </p>
                        </div>
                        <a
                            href="https://wa.me/919310010763?text=Hi, I'm interested in joining the WabMeta team!"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <Mail className="w-5 h-5 mr-2" />
                            Get in Touch
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Team;