import { Document, Image, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { DEFAULT_SECTION_LABELS } from '@/lib/resume-builder/defaults';
import type { CustomSection, ResumeConfig } from '@/lib/resume-builder/types';
import {
    formatResumeDateRange,
    formatResumeLinkLabel,
    getResumePdfFontFamily,
    normalizeResumeHref,
    sortResumeSections,
} from '@/lib/resume-builder/utils';

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.5,
        paddingHorizontal: 34,
        paddingVertical: 32,
    },
    header: {
        borderBottomColor: '#cbd5e1',
        borderBottomWidth: 1,
        marginBottom: 18,
        paddingBottom: 14,
    },
    headerRow: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: 16,
        justifyContent: 'space-between',
    },
    headerContent: {
        flex: 1,
    },
    name: {
        color: '#020617',
        fontFamily: 'Helvetica',
        fontSize: 23,
        fontWeight: 700,
        lineHeight: 1.15,
        marginBottom: 3,
    },
    jobTitle: {
        color: '#334155',
        fontSize: 11.5,
        marginBottom: 10,
    },
    contactList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    contactItem: {
        color: '#0f172a',
        fontSize: 9,
    },
    link: {
        color: '#0f172a',
        fontSize: 9,
        textDecoration: 'none',
    },
    image: {
        borderColor: '#cbd5e1',
        borderRadius: 8,
        borderWidth: 1,
        height: 74,
        objectFit: 'cover',
        width: 74,
    },
    section: {
        marginBottom: 14,
    },
    sectionTitle: {
        borderBottomColor: '#e2e8f0',
        borderBottomWidth: 1,
        color: '#0f172a',
        fontFamily: 'Helvetica',
        fontSize: 11.5,
        fontWeight: 700,
        marginBottom: 8,
        paddingBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    summary: {
        color: '#334155',
        fontSize: 9.75,
        lineHeight: 1.55,
    },
    skillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 2,
        // marginTop: 4,
    },
    skillChip: {
        // backgroundColor: '#f8fafc',
        // borderColor: '#cbd5e1',
        // borderRadius: 999,
        // borderWidth: 1,
        color: '#0f172a',
        fontSize: 8.75,
        // paddingHorizontal: 8,
        // paddingBottom: 4,
    },
    itemRow: {
        borderLeftColor: '#cbd5e1',
        borderLeftWidth: 2,
        marginBottom: 10,
        paddingLeft: 10,
    },
    itemHeader: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'space-between',
        marginBottom: 3,
    },
    itemHeaderContent: {
        flex: 1,
    },
    itemTitle: {
        color: '#020617',
        fontSize: 10.5,
        fontWeight: 700,
    },
    itemSubtitle: {
        color: '#334155',
        fontSize: 9.25,
        marginTop: 2,
    },
    itemDate: {
        color: '#475569',
        fontSize: 8.5,
        textAlign: 'right',
    },
    itemBody: {
        color: '#334155',
        fontSize: 9.25,
        lineHeight: 1.55,
    },
    list: {
        gap: 4,
    },
    listItem: {
        flexDirection: 'row',
        gap: 6,
    },
    bullet: {
        color: '#475569',
        fontSize: 9,
        width: 8,
    },
    listText: {
        color: '#334155',
        flex: 1,
        fontSize: 9.25,
        lineHeight: 1.55,
    },
});

function renderTextSection(section: CustomSection, fontFamily: string) {
    if (typeof section.value !== 'string' || !section.value.trim()) {
        return null;
    }

    return (
        <View key={section.id} style={styles.section}>
            <Text style={[styles.sectionTitle, { fontFamily }]}>{section.title}</Text>
            <Text style={[styles.summary, { fontFamily }]}>{section.value}</Text>
        </View>
    );
}

function renderListSection(section: CustomSection, fontFamily: string) {
    if (!Array.isArray(section.value) || section.value.length === 0) {
        return null;
    }

    return (
        <View key={section.id} style={styles.section}>
            <Text style={[styles.sectionTitle, { fontFamily }]}>{section.title}</Text>
            <View style={styles.list}>
                {section.value.map((item) => (
                    <View key={item.id} style={styles.listItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={[styles.listText, { fontFamily }]}>{item.value}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export function ResumePdfDocument({ config }: { config: ResumeConfig }) {
    const sortedSections = sortResumeSections(config.sections).filter(
        (section) => section.enabled
    );
    const baseFont = getResumePdfFontFamily(config.fontFamily);

    return (
        <Document author={config.header.fullName} title={`${config.header.fullName} Resume`}>
            <Page size="A4" style={[styles.page, { fontFamily: baseFont }]}>
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <View style={styles.headerContent}>
                            <Text style={[styles.name, { fontFamily: baseFont }]}>
                                {config.header.fullName}
                            </Text>
                            <Text style={[styles.jobTitle, { fontFamily: baseFont }]}>
                                {config.header.jobTitle}
                            </Text>
                            <View style={styles.contactList}>
                                {config.header.email ? (
                                    <Link
                                        src={`mailto:${config.header.email}`}
                                        style={styles.link}
                                    >
                                        {config.header.email}
                                    </Link>
                                ) : null}
                                {config.header.phone ? (
                                    <Link
                                        src={`tel:${config.header.phone}`}
                                        style={styles.link}
                                    >
                                        {config.header.phone}
                                    </Link>
                                ) : null}
                                {config.header.location ? (
                                    <Text style={styles.contactItem}>
                                        {config.header.location}
                                    </Text>
                                ) : null}
                                {config.header.website ? (
                                    <Link
                                        src={normalizeResumeHref(config.header.website)}
                                        style={styles.link}
                                    >
                                        {formatResumeLinkLabel(config.header.website)}
                                    </Link>
                                ) : null}
                                {config.header.linkedin ? (
                                    <Link
                                        src={normalizeResumeHref(config.header.linkedin)}
                                        style={styles.link}
                                    >
                                        {formatResumeLinkLabel(config.header.linkedin)}
                                    </Link>
                                ) : null}
                                {config.header.github ? (
                                    <Link
                                        src={normalizeResumeHref(config.header.github)}
                                        style={styles.link}
                                    >
                                        {formatResumeLinkLabel(config.header.github)}
                                    </Link>
                                ) : null}
                            </View>
                        </View>

                        {config.header.image?.dataUrl ? (
                            <Image src={config.header.image.dataUrl} style={styles.image} />
                        ) : null}
                    </View>
                </View>

                {sortedSections.map((section) => {
                    if (section.id === 'summary' && config.summary.trim()) {
                        return (
                            <View key={section.id} style={styles.section} wrap={false}>
                                <Text
                                    style={[
                                        styles.sectionTitle,
                                        {
                                            fontFamily: getResumePdfFontFamily(
                                                config.sectionFonts.summary
                                            ),
                                        },
                                    ]}
                                >
                                    {DEFAULT_SECTION_LABELS.summary}
                                </Text>
                                <Text
                                    style={[
                                        styles.summary,
                                        {
                                            fontFamily: getResumePdfFontFamily(
                                                config.sectionFonts.summary
                                            ),
                                        },
                                    ]}
                                >
                                    {config.summary}
                                </Text>
                            </View>
                        );
                    }

                    if (section.id === 'skills' && config.skills.length > 0) {
                        const fontFamily = getResumePdfFontFamily(config.sectionFonts.skills);

                        return (
                            <View key={section.id} style={styles.section} wrap={false}>
                                <Text style={[styles.sectionTitle, { fontFamily }]}>
                                    {DEFAULT_SECTION_LABELS.skills}
                                </Text>
                                <View style={styles.skillsRow}>
                                    <Text style={[styles.skillChip, { fontFamily }]}>
                                        {config.skills.map((skill) => skill.name).join(', ')}
                                    </Text>
                                </View>
                            </View>
                        );
                    }

                    if (section.id === 'experience' && config.experience.length > 0) {
                        const fontFamily = getResumePdfFontFamily(
                            config.sectionFonts.experience
                        );

                        return (
                            <View key={section.id} style={styles.section}>
                                <Text style={[styles.sectionTitle, { fontFamily }]}>
                                    {DEFAULT_SECTION_LABELS.experience}
                                </Text>
                                {config.experience.map((experience) => (
                                    <View
                                        key={experience.id}
                                        style={styles.itemRow}
                                        wrap={false}
                                    >
                                        <View style={styles.itemHeader}>
                                            <View style={styles.itemHeaderContent}>
                                                <Text
                                                    style={[styles.itemTitle, { fontFamily }]}
                                                >
                                                    {experience.position}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.itemSubtitle,
                                                        { fontFamily },
                                                    ]}
                                                >
                                                    {experience.company}
                                                </Text>
                                            </View>
                                            <Text style={[styles.itemDate, { fontFamily }]}>
                                                {formatResumeDateRange(
                                                    experience.startDate,
                                                    experience.endDate,
                                                    experience.current
                                                )}
                                            </Text>
                                        </View>
                                        <Text style={[styles.itemBody, { fontFamily }]}>
                                            {experience.description}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    if (section.id === 'education' && config.education.length > 0) {
                        const fontFamily = getResumePdfFontFamily(
                            config.sectionFonts.education
                        );

                        return (
                            <View key={section.id} style={styles.section}>
                                <Text style={[styles.sectionTitle, { fontFamily }]}>
                                    {DEFAULT_SECTION_LABELS.education}
                                </Text>
                                {config.education.map((education) => (
                                    <View
                                        key={education.id}
                                        style={styles.itemRow}
                                        wrap={false}
                                    >
                                        <View style={styles.itemHeader}>
                                            <View style={styles.itemHeaderContent}>
                                                <Text
                                                    style={[styles.itemTitle, { fontFamily }]}
                                                >
                                                    {education.degree}
                                                    {education.field
                                                        ? ` in ${education.field}`
                                                        : ''}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.itemSubtitle,
                                                        { fontFamily },
                                                    ]}
                                                >
                                                    {education.school}
                                                </Text>
                                            </View>
                                            <Text style={[styles.itemDate, { fontFamily }]}>
                                                {formatResumeDateRange(
                                                    education.startDate,
                                                    education.endDate,
                                                    education.current
                                                )}
                                            </Text>
                                        </View>
                                        {education.description ? (
                                            <Text style={[styles.itemBody, { fontFamily }]}>
                                                {education.description}
                                            </Text>
                                        ) : null}
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    return null;
                })}

                {config.customSections.map((section) => {
                    const fontFamily = getResumePdfFontFamily(config.fontFamily);

                    if (section.fieldType === 'list') {
                        return renderListSection(section, fontFamily);
                    }

                    return renderTextSection(section, fontFamily);
                })}
            </Page>
        </Document>
    );
}
