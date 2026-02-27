import { Document, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { siteConfig } from '@/configs/site';

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
    summary?: string;
}

const styles = StyleSheet.create({
    page: {
        padding: 36,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.4,
        color: '#1a1a1a',
    },
    // Header
    header: {
        marginBottom: 12,
        paddingBottom: 10,
        borderBottom: 1.5,
        borderBottomColor: '#333333',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 3,
        color: '#111111',
        letterSpacing: 0.3,
    },
    title: {
        fontSize: 12,
        color: '#444444',
        marginTop: 6,
        marginBottom: 4,
    },
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    contactItem: {
        fontSize: 9,
        color: '#555555',
    },
    contactLink: {
        fontSize: 9,
        color: '#1a56db',
        textDecoration: 'none',
    },
    // Sections
    section: {
        marginTop: 14,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#111111',
        textTransform: 'uppercase',
        letterSpacing: 1,
        borderBottom: 0.75,
        borderBottomColor: '#cccccc',
        paddingBottom: 3,
    },
    // Summary
    summary: {
        fontSize: 10,
        color: '#333333',
        lineHeight: 1.5,
        marginTop: 2,
    },
    // Experience / Education items
    itemContainer: {
        marginBottom: 10,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 2,
    },
    itemTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#111111',
    },
    itemSubtitle: {
        fontSize: 10,
        color: '#1a56db',
    },
    itemDate: {
        fontSize: 9,
        color: '#666666',
        textAlign: 'right',
    },
    itemDescription: {
        fontSize: 9.5,
        color: '#333333',
        marginTop: 2,
        lineHeight: 1.5,
    },
    // Bullet list
    bulletList: {
        marginTop: 3,
        marginLeft: 8,
    },
    bulletItem: {
        fontSize: 9.5,
        marginBottom: 2,
        color: '#333333',
        lineHeight: 1.4,
    },
    // Technologies
    techRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
        gap: 4,
    },
    techTag: {
        fontSize: 8,
        backgroundColor: '#f0f0f0',
        color: '#333333',
        padding: '2 6',
        borderRadius: 2,
    },
    // Skills
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 2,
        marginTop: 4,
    },
    skillItem: {
        fontSize: 9.5,
        backgroundColor: '#f5f5f5',
        color: '#222222',
        padding: '3 8',
        borderRadius: 3,
    },
    // Grade
    grade: {
        fontSize: 9,
        color: '#555555',
        marginTop: 1,
    },
});

export function ResumePDF({ data }: { data: ResumeData }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{data.user.name}</Text>
                    <Text style={styles.title}>Full-Stack Web Developer</Text>
                    <View style={styles.contactRow}>
                        {data.user.email && (
                            <Link src={`mailto:${data.user.email}`} style={styles.contactLink}>
                                {data.user.email}
                            </Link>
                        )}
                        <Link src={siteConfig.baseUrl} style={styles.contactLink}>
                            {siteConfig.baseUrl.replace('https://', '')}
                        </Link>
                        <Link src={siteConfig.links.github} style={styles.contactLink}>
                            {siteConfig.links.github.replace('https://', '')}
                        </Link>
                        <Link src={siteConfig.links.linkedin} style={styles.contactLink}>
                            {siteConfig.links.linkedin.replace('https://', '')}
                        </Link>
                    </View>
                </View>

                {/* Summary */}
                {data.summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Professional Summary</Text>
                        <Text style={styles.summary}>{data.summary}</Text>
                    </View>
                )}

                {/* Skills — placed early for ATS scanners */}
                {data.skills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Technical Skills</Text>
                        <View style={styles.skillsGrid}>
                            {data.skills.map((skill) => (
                                <Text key={skill.id} style={styles.skillItem}>
                                    {skill.title}
                                </Text>
                            ))}
                        </View>
                    </View>
                )}

                {/* Experience */}
                {data.experiences.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Experience</Text>
                        {data.experiences.map((exp) => (
                            <View key={exp.id} style={styles.itemContainer}>
                                <View style={styles.itemHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.itemTitle}>{exp.position}</Text>
                                        <Text style={styles.itemSubtitle}>
                                            {exp.company}
                                            {exp.location && ` — ${exp.location}`}
                                        </Text>
                                    </View>
                                    <Text style={styles.itemDate}>
                                        {exp.start_date} – {exp.end_date || 'Present'}
                                    </Text>
                                </View>
                                <Text style={styles.itemDescription}>{exp.description}</Text>

                                {exp.achievements.length > 0 && (
                                    <View style={styles.bulletList}>
                                        {exp.achievements.map((achievement, idx) => (
                                            <Text key={idx} style={styles.bulletItem}>
                                                • {achievement}
                                            </Text>
                                        ))}
                                    </View>
                                )}

                                {exp.technologies.length > 0 && (
                                    <View style={styles.techRow}>
                                        {exp.technologies.map((tech, idx) => (
                                            <Text key={idx} style={styles.techTag}>
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
                            <View key={edu.id} style={styles.itemContainer}>
                                <View style={styles.itemHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.itemTitle}>{edu.degree}</Text>
                                        <Text style={styles.itemSubtitle}>
                                            {edu.institution}
                                            {edu.location && ` — ${edu.location}`}
                                        </Text>
                                    </View>
                                    <Text style={styles.itemDate}>
                                        {edu.start_date} – {edu.end_date || 'Present'}
                                    </Text>
                                </View>
                                {edu.grade && (
                                    <Text style={styles.grade}>Grade: {edu.grade}</Text>
                                )}
                                {edu.description && (
                                    <Text style={styles.itemDescription}>
                                        {edu.description}
                                    </Text>
                                )}
                                {edu.achievements && edu.achievements.length > 0 && (
                                    <View style={styles.bulletList}>
                                        {edu.achievements.map((achievement, idx) => (
                                            <Text key={idx} style={styles.bulletItem}>
                                                • {achievement}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    );
}
