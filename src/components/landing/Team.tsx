// src/components/landing/Team.tsx
import React from 'react';
import { Linkedin, Twitter, Mail } from 'lucide-react';

interface TeamMember {
    name: string;
    role: string;
    image: string;
    description: string;
    social?: {
        linkedin?: string;
        twitter?: string;
        email?: string;
    };
}

const teamMembers: TeamMember[] = [
    {
        name: 'Ankit Verma',
        role: 'CEO & Founder',
        image: 'https://ui-avatars.com/api/?name=Ankit+Verma&size=200&background=25D366&color=fff&bold=true',
        description: 'Visionary leader with expertise in business strategy and WhatsApp Business solutions.',
        social: {
            linkedin: '#',
            twitter: '#',
            email: 'ankit@wabmeta.com'
        }
    },
    {
        name: 'Samir Thakur',
        role: 'Lead Developer',
        image: 'https://ui-avatars.com/api/?name=Samir+Thakur&size=200&background=128C7E&color=fff&bold=true',
        description: 'Full-stack developer passionate about building scalable WhatsApp automation solutions.',
        social: {
            linkedin: '#',
            twitter: '#',
            email: 'samir@wabmeta.com'
        }
    }
];

const Team: React.FC = () => {
    return (
        <section id="team" className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-base text-green-600 dark:text-green-400 font-semibold tracking-wide uppercase">
                        Our Team
                    </h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Meet the Minds Behind WabMeta
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 mx-auto">
                        Dedicated professionals committed to revolutionizing WhatsApp Business communication.
                    </p>
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    {teamMembers.map((member, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300"
                        >
                            {/* Member Image */}
                            <div className="relative h-64 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-40 h-40 rounded-full border-4 border-white shadow-lg object-cover"
                                />
                                {/* Role Badge */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 px-4 py-1 rounded-full text-sm font-semibold shadow-md">
                                        {member.role}
                                    </span>
                                </div>
                            </div>

                            {/* Member Info */}
                            <div className="p-6 text-center">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {member.name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    {member.description}
                                </p>

                                {/* Social Links */}
                                {member.social && (
                                    <div className="flex justify-center space-x-4">
                                        {member.social.linkedin && (
                                            <a
                                                href={member.social.linkedin}
                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Linkedin className="w-6 h-6" />
                                            </a>
                                        )}
                                        {member.social.twitter && (
                                            <a
                                                href={member.social.twitter}
                                                className="text-gray-400 hover:text-blue-400 transition-colors"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Twitter className="w-6 h-6" />
                                            </a>
                                        )}
                                        {member.social.email && (
                                            <a
                                                href={`mailto:${member.social.email}`}
                                                className="text-gray-400 hover:text-green-600 transition-colors"
                                            >
                                                <Mail className="w-6 h-6" />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Join Team CTA */}
                <div className="mt-16 text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Want to join our growing team?
                    </p>
                    <a
                        href="https://wa.me/919310010763?text=Hi, I'm interested in joining the WabMeta team!"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                        Get in Touch
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Team;