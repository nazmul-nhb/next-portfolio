import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

// Define types
interface Experience {
    id: number;
    position: string;
    company: string;
    location: string | null;
    start_date: string;
    end_date: string | null;
    description: string;
    technologies: string[];
    achievements: string[];
}

interface Education {
    id: number;
    degree: string;
    institution: string;
    location: string | null;
    start_date: string;
    end_date: string | null;
    grade: string | null;
    description: string | null;
    achievements: string[] | null;
}

interface Skill {
    id: number;
    title: string;
    icon: string;
}

interface User {
    name: string;
    email: string;
    profile_image?: string | null;
}

interface ResumeData {
    user: User;
    experiences: Experience[];
    education: Education[];
    skills: Skill[];
}

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 11,
        lineHeight: 1.5,
    },
    header: {
        marginBottom: 20,
        borderBottom: 2,
        borderBottomColor: '#2563eb',
        paddingBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#1e3a8a',
    },
    contact: {
        fontSize: 10,
        color: '#64748b',
        marginBottom: 2,
    },
    section: {
        marginTop: 15,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1e3a8a',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    experienceItem: {
        marginBottom: 12,
    },
    jobTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    company: {
        fontSize: 11,
        color: '#2563eb',
        marginBottom: 2,
    },
    date: {
        fontSize: 9,
        color: '#64748b',
        marginBottom: 4,
    },
    description: {
        fontSize: 10,
        marginBottom: 4,
        color: '#334155',
    },
    bulletList: {
        marginLeft: 10,
        marginTop: 4,
    },
    bullet: {
        fontSize: 10,
        marginBottom: 2,
        color: '#475569',
    },
    technologies: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    tech: {
        fontSize: 9,
        backgroundColor: '#e0f2fe',
        color: '#0369a1',
        padding: '3 6',
        marginRight: 5,
        marginBottom: 3,
        borderRadius: 3,
    },
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    skillItem: {
        fontSize: 10,
        backgroundColor: '#f1f5f9',
        padding: '4 8',
        borderRadius: 4,
        marginBottom: 4,
    },
});

export function ResumePDF({ data }: { data: ResumeData }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{data.user.name}</Text>
                    {data.user.email && <Text style={styles.contact}>{data.user.email}</Text>}
                    <Text style={styles.contact}>Web: https://nazmul-nhb.dev</Text>
                </View>

                {/* Experience */}
                {data.experiences.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Experience</Text>
                        {data.experiences.map((exp) => (
                            <View key={exp.id} style={styles.experienceItem}>
                                <Text style={styles.jobTitle}>{exp.position}</Text>
                                <Text style={styles.company}>
                                    {exp.company}
                                    {exp.location && ` • ${exp.location}`}
                                </Text>
                                <Text style={styles.date}>
                                    {exp.start_date} - {exp.end_date || 'Present'}
                                </Text>
                                <Text style={styles.description}>{exp.description}</Text>

                                {exp.achievements.length > 0 && (
                                    <View style={styles.bulletList}>
                                        {exp.achievements.map((achievement, idx) => (
                                            <Text key={idx} style={styles.bullet}>
                                                • {achievement}
                                            </Text>
                                        ))}
                                    </View>
                                )}

                                {exp.technologies.length > 0 && (
                                    <View style={styles.technologies}>
                                        {exp.technologies.map((tech, idx) => (
                                            <Text key={idx} style={styles.tech}>
                                                {tech}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Education */}
                {data.education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {data.education.map((edu) => (
                            <View key={edu.id} style={styles.experienceItem}>
                                <Text style={styles.jobTitle}>{edu.degree}</Text>
                                <Text style={styles.company}>
                                    {edu.institution}
                                    {edu.location && ` • ${edu.location}`}
                                </Text>
                                <Text style={styles.date}>
                                    {edu.start_date} - {edu.end_date || 'Present'}
                                    {edu.grade && ` • ${edu.grade}`}
                                </Text>
                                {edu.description && (
                                    <Text style={styles.description}>{edu.description}</Text>
                                )}
                                {edu.achievements && edu.achievements.length > 0 && (
                                    <View style={styles.bulletList}>
                                        {edu.achievements.map((achievement, idx) => (
                                            <Text key={idx} style={styles.bullet}>
                                                • {achievement}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Skills */}
                {data.skills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.skillsGrid}>
                            {data.skills.map((skill) => (
                                <Text key={skill.id} style={styles.skillItem}>
                                    {skill.title}
                                </Text>
                            ))}
                        </View>
                    </View>
                )}
            </Page>
        </Document>
    );
}
