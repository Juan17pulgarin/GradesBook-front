import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: "Helvetica",
        backgroundColor: "#ffffff",
    },

    // Encabezado
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 28,
        paddingBottom: 16,
        borderBottom: "2px solid #0284c7",
    },
    headerLeft: {
        flexDirection: "column",
    },
    schoolName: {
        fontSize: 20,
        fontFamily: "Helvetica-Bold",
        color: "#0284c7",
    },
    docTitle: {
        fontSize: 11,
        color: "#64748b",
        marginTop: 3,
    },
    headerRight: {
        alignItems: "flex-end",
    },
    periodBox: {
        backgroundColor: "#f0f9ff",
        borderRadius: 6,
        padding: "6 10",
        alignItems: "center",
    },
    periodLabel: {
        fontSize: 8,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    periodName: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: "#0284c7",
        marginTop: 2,
    },

    // Info estudiante
    studentSection: {
        backgroundColor: "#f8fafc",
        borderRadius: 8,
        padding: "12 16",
        marginBottom: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    studentName: {
        fontSize: 14,
        fontFamily: "Helvetica-Bold",
        color: "#0f172a",
    },
    studentLabel: {
        fontSize: 9,
        color: "#94a3b8",
        marginBottom: 3,
        textTransform: "uppercase",
    },
    promedioBox: {
        alignItems: "center",
        backgroundColor: "#0284c7",
        borderRadius: 8,
        padding: "8 16",
    },
    promedioValue: {
        fontSize: 22,
        fontFamily: "Helvetica-Bold",
        color: "#ffffff",
    },
    promedioLabel: {
        fontSize: 7,
        color: "#bae6fd",
        textTransform: "uppercase",
        marginTop: 2,
    },

    // Tabla
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#0284c7",
        borderRadius: "4 4 0 0",
        padding: "8 12",
        marginTop: 8,
    },
    tableHeaderText: {
        color: "#ffffff",
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: "row",
        padding: "10 12",
        borderBottom: "1px solid #e2e8f0",
        alignItems: "center",
    },
    tableRowAlt: {
        backgroundColor: "#f8fafc",
    },
    colMateria: { flex: 3 },
    colNota: { flex: 1, alignItems: "center" },
    colComentario: { flex: 3 },
    colEstado: { flex: 1.5, alignItems: "center" },

    cellText: {
        fontSize: 9,
        color: "#334155",
    },
    cellTextBold: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: "#0f172a",
    },
    notaText: {
        fontSize: 13,
        fontFamily: "Helvetica-Bold",
    },

    // Badges de estado
    badge: {
        borderRadius: 10,
        padding: "3 7",
    },
    badgeAprobado: { backgroundColor: "#dcfce7" },
    badgeRiesgo: { backgroundColor: "#fef9c3" },
    badgeReprobado: { backgroundColor: "#fee2e2" },
    badgeTextAprobado: { fontSize: 7, color: "#15803d", fontFamily: "Helvetica-Bold" },
    badgeTextRiesgo: { fontSize: 7, color: "#92400e", fontFamily: "Helvetica-Bold" },
    badgeTextReprobado: { fontSize: 7, color: "#b91c1c", fontFamily: "Helvetica-Bold" },

    // Pie
    footer: {
        marginTop: 28,
        paddingTop: 12,
        borderTop: "1px solid #e2e8f0",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    footerText: {
        fontSize: 8,
        color: "#94a3b8",
    },
    footerBrand: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        color: "#0284c7",
    },

    emptyMsg: {
        fontSize: 11,
        color: "#94a3b8",
        textAlign: "center",
        marginTop: 30,
    },
});

function getNotaColor(nota) {
    const n = parseFloat(nota);
    if (n >= 3.5) return "#15803d";
    if (n >= 3.0) return "#92400e";
    return "#b91c1c";
}

function EstadoBadge({ nota }) {
    const n = parseFloat(nota);
    if (n >= 3.5) return (
        <View style={[styles.badge, styles.badgeAprobado]}>
            <Text style={styles.badgeTextAprobado}>APROBADO</Text>
        </View>
    );
    if (n >= 3.0) return (
        <View style={[styles.badge, styles.badgeRiesgo]}>
            <Text style={styles.badgeTextRiesgo}>EN RIESGO</Text>
        </View>
    );
    return (
        <View style={[styles.badge, styles.badgeReprobado]}>
            <Text style={styles.badgeTextReprobado}>REPROBADO</Text>
        </View>
    );
}

/**
 * Props:
 *  - estudiante: { nombreCompleto: string }
 *  - periodo: { nombre: string, fecha_inicio: string, fecha_fin: string }
 *  - boletin: [{ asignatura, nota, comentario }]
 *  - promedioGeneral: string | number
 */
export default function BoletinPDF({ estudiante, periodo, boletin, promedioGeneral }) {
    const fechaEmision = new Date().toLocaleDateString("es-CO", {
        year: "numeric", month: "long", day: "numeric",
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Encabezado */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.schoolName}>GradesBook</Text>
                        <Text style={styles.docTitle}>Boletín Oficial de Calificaciones</Text>
                    </View>
                    {periodo && (
                        <View style={styles.periodBox}>
                            <Text style={styles.periodLabel}>Periodo académico</Text>
                            <Text style={styles.periodName}>{periodo.nombre}</Text>
                        </View>
                    )}
                </View>

                {/* Info estudiante */}
                <View style={styles.studentSection}>
                    <View>
                        <Text style={styles.studentLabel}>Estudiante</Text>
                        <Text style={styles.studentName}>{estudiante?.nombreCompleto || "—"}</Text>
                        {periodo && (
                            <Text style={[styles.cellText, { marginTop: 4, color: "#64748b" }]}>
                                {new Date(periodo.fecha_inicio).toLocaleDateString("es-CO")}
                                {" — "}
                                {new Date(periodo.fecha_fin).toLocaleDateString("es-CO")}
                            </Text>
                        )}
                    </View>
                    <View style={styles.promedioBox}>
                        <Text style={styles.promedioValue}>{promedioGeneral}</Text>
                        <Text style={styles.promedioLabel}>Promedio general</Text>
                    </View>
                </View>

                {/* Tabla */}
                <View style={styles.tableHeader}>
                    <View style={styles.colMateria}>
                        <Text style={styles.tableHeaderText}>Asignatura</Text>
                    </View>
                    <View style={styles.colNota}>
                        <Text style={styles.tableHeaderText}>Nota</Text>
                    </View>
                    <View style={styles.colComentario}>
                        <Text style={styles.tableHeaderText}>Comentario</Text>
                    </View>
                    <View style={styles.colEstado}>
                        <Text style={styles.tableHeaderText}>Estado</Text>
                    </View>
                </View>

                {boletin.length === 0 && (
                    <Text style={styles.emptyMsg}>Sin notas registradas para este periodo.</Text>
                )}

                {boletin.map((b, i) => (
                    <View key={i} style={[styles.tableRow, i % 2 !== 0 && styles.tableRowAlt]}>
                        <View style={styles.colMateria}>
                            <Text style={styles.cellTextBold}>{b.asignatura}</Text>
                        </View>
                        <View style={styles.colNota}>
                            <Text style={[styles.notaText, { color: getNotaColor(b.nota) }]}>
                                {b.nota}
                            </Text>
                        </View>
                        <View style={styles.colComentario}>
                            <Text style={styles.cellText}>{b.comentario}</Text>
                        </View>
                        <View style={styles.colEstado}>
                            <EstadoBadge nota={b.nota} />
                        </View>
                    </View>
                ))}

                {/* Pie */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Emitido el {fechaEmision}</Text>
                    <Text style={styles.footerBrand}>GradesBook • Sistema de Gestión Académica</Text>
                </View>

            </Page>
        </Document>
    );
}
