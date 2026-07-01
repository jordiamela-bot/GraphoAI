import math
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak
from reportlab.graphics.shapes import Drawing, Rect, Line, Polygon, String, Circle, Group

def draw_radar_chart(indexes_dict):
    """Draws a custom vector radar chart using ReportLab graphics shapes."""
    # Chart configuration
    width, height = 460, 220
    cx, cy = 230, 110
    max_radius = 80
    
    d = Drawing(width, height)
    
    # White background card
    d.add(Rect(0, 0, width, height, fillColor=colors.HexColor('#f8fafc'), strokeColor=colors.HexColor('#e2e8f0'), rx=8, ry=8))
    
    labels = [
        "Lideratge", "Organització", "Creativitat", "Empatia", "Constància",
        "Comunicació", "Iniciativa", "Flexibilitat", "Autocontrol", "Treball en equip"
    ]
    
    # Extract scores corresponding to labels
    keys_map = {
        "Lideratge": "lideratge",
        "Organització": "organitzacio",
        "Creativitat": "creativitat",
        "Empatia": "empatia",
        "Constància": "constancia",
        "Comunicació": "comunicacio",
        "Iniciativa": "iniciativa",
        "Flexibilitat": "flexibilitat",
        "Autocontrol": "autocontrol",
        "Treball en equip": "treball_en_equip"
    }
    
    scores = []
    for label in labels:
        key = keys_map[label]
        scores.append(indexes_dict.get(key, 50))
        
    num_vars = len(labels)
    angle_step = 2 * math.pi / num_vars
    
    # 1. Draw concentric grid polygons (10-sided decagons at 25%, 50%, 75%, 100%)
    for r_pct in [0.25, 0.5, 0.75, 1.0]:
        r = max_radius * r_pct
        points = []
        for i in range(num_vars):
            angle = i * angle_step - math.pi/2
            x = cx + r * math.cos(angle)
            y = cy + r * math.sin(angle)
            points.append((x, y))
            
        # Draw lines between points to form a decagon
        for i in range(num_vars):
            x1, y1 = points[i]
            x2, y2 = points[(i + 1) % num_vars]
            d.add(Line(x1, y1, x2, y2, strokeColor=colors.HexColor('#cbd5e1'), strokeWidth=0.5))
            
    # 2. Draw axes lines and labels
    for i in range(num_vars):
        angle = i * angle_step - math.pi/2
        # Axis line
        ax = cx + max_radius * math.cos(angle)
        ay = cy + max_radius * math.sin(angle)
        d.add(Line(cx, cy, ax, ay, strokeColor=colors.HexColor('#94a3b8'), strokeWidth=0.5))
        
        # Label placement (slightly offset outwards)
        lx = cx + (max_radius + 15) * math.cos(angle)
        ly = cy + (max_radius + 10) * math.sin(angle)
        
        # Adjust text alignment slightly based on position
        anchor = 'middle'
        if math.cos(angle) > 0.1:
            anchor = 'start'
        elif math.cos(angle) < -0.1:
            anchor = 'end'
            
        # Vertical adjustment
        y_offset = -3
        if math.sin(angle) > 0.8:
            y_offset = 3
        elif math.sin(angle) < -0.8:
            y_offset = -8
            
        d.add(String(lx, ly + y_offset, labels[i], fontName='Helvetica-Bold', fontSize=8, fillColor=colors.HexColor('#475569'), textAnchor=anchor))

    # 3. Draw Data Polygon
    data_points = []
    for i in range(num_vars):
        score = scores[i]
        r = max_radius * (score / 100.0)
        angle = i * angle_step - math.pi/2
        x = cx + r * math.cos(angle)
        y = cy + r * math.sin(angle)
        data_points.append(x)
        data_points.append(y)
        
        # Draw small circle marker
        d.add(Circle(x, y, 2.5, fillColor=colors.HexColor('#2563eb'), strokeColor=colors.HexColor('#ffffff'), strokeWidth=0.5))
        
    d.add(Polygon(data_points, fillColor=colors.HexColor('#3b82f633'), strokeColor=colors.HexColor('#2563eb'), strokeWidth=2.0))
    
    # 4. Center dot
    d.add(Circle(cx, cy, 2, fillColor=colors.HexColor('#64748b'), strokeColor=None))
    
    return d

def generate_pdf_report(report_data, output_stream):
    """
    Generates a beautifully formatted PDF report for GraphoAI.
    Outputs the compiled PDF to the output_stream.
    """
    doc = SimpleDocTemplate(
        output_stream,
        pagesize=letter,
        leftMargin=54, # 0.75 in
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles definitions
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#4b5563'),
        spaceAfter=25
    )
    
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#1e3a8a'),
        spaceBefore=18,
        spaceAfter=10,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#1e40af'),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8
    )
    
    bullet_style = ParagraphStyle(
        'DocBullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=5
    )
    
    legal_style = ParagraphStyle(
        'DocLegal',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#64748b'),
        spaceBefore=20,
        spaceAfter=10
    )
    
    story = []
    
    # --- Header Banner ---
    story.append(Paragraph("GraphoAI", title_style))
    story.append(Paragraph("Informe grafopsicològic assistit per intel·ligència artificial", subtitle_style))
    
    # Horizontal Rule
    story.append(Table([[""]], colWidths=[500], rowHeights=[2], style=TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1e3a8a')),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ])))
    story.append(Spacer(1, 15))
    
    # --- Executive Summary ---
    story.append(Paragraph("Resum executiu", h1_style))
    story.append(Paragraph(report_data['resum_executiu'], body_style))
    story.append(Spacer(1, 10))
    
    # --- Personality Section ---
    story.append(Paragraph("1. Personalitat i Capacitats Cognitives", h1_style))
    p_data = report_data['personalitat']
    
    story.append(Paragraph("Forma de pensar:", h2_style))
    story.append(Paragraph(p_data['forma_de_pensar'], body_style))
    
    story.append(Paragraph("Intel·ligència pràctica i creativitat:", h2_style))
    story.append(Paragraph(f"<b>Intel·ligència pràctica:</b> {p_data['intelligencia_practica']}<br/><b>Creativitat:</b> {p_data['creativitat']}", body_style))
    
    story.append(Paragraph("Organització i constància:", h2_style))
    story.append(Paragraph(f"<b>Organització:</b> {p_data['organitzacio']}<br/><b>Constància:</b> {p_data['constancia']}", body_style))
    
    story.append(Paragraph("Aprenentatge, anàlisi i motivació:", h2_style))
    story.append(Paragraph(f"<b>Capacitat d'aprenentatge:</b> {p_data['capacitat_aprenentatge']}<br/><b>Anàlisi:</b> {p_data['capacitat_analitica']}<br/><b>Motivació:</b> {p_data['motivacio']}", body_style))
    
    story.append(Paragraph("Autocontrol:", h2_style))
    story.append(Paragraph(p_data['autocontrol'], body_style))
    
    story.append(PageBreak()) # Clean break to keep relationships and workplace together
    
    # --- Personal Relations ---
    story.append(Paragraph("2. Relacions Personals i Comunicació", h1_style))
    r_data = report_data['relacions_personals']
    story.append(Paragraph(f"<b>Empatia:</b> {r_data['empatia']}", body_style))
    story.append(Paragraph(f"<b>Comunicació:</b> {r_data['comunicacio']}", body_style))
    story.append(Paragraph(f"<b>Treball en equip:</b> {r_data['treball_en_equip']}", body_style))
    story.append(Paragraph(f"<b>Capacitat d'escolta i assertivitat:</b> {r_data['capacitat_escolta']} {r_data['assertivitat']}", body_style))
    story.append(Paragraph(f"<b>Lideratge i adaptació:</b> {r_data['lideratge']} {r_data['adaptacio']}", body_style))
    story.append(Spacer(1, 10))
    
    # --- Workplace Environment ---
    story.append(Paragraph("3. Compatibilitat d'Entorn Laboral", h1_style))
    story.append(Paragraph("Segons l'anàlisi grafopsicològica de l'escriptura, el perfil podria sentir-se més còmode o compatible amb els següents rols:", body_style))
    
    w_data = report_data['entorn_laboral']
    
    # Build compatibility table
    table_data = [
        [Paragraph("<b>Àrea de Treball</b>", body_style), Paragraph("<b>Grau de Compatibilitat i Detall</b>", body_style)],
        [Paragraph("Direcció i Gestió", body_style), Paragraph(f"<b>Direcció:</b> {w_data['direccio']}<br/><b>Gestió:</b> {w_data['gestio']}", body_style)],
        [Paragraph("Creativitat i Disseny", body_style), Paragraph(w_data['creativitat'], body_style)],
        [Paragraph("Investigació i R+D", body_style), Paragraph(w_data['investigacio'], body_style)],
        [Paragraph("Enginyeria i Tècnic", body_style), Paragraph(w_data['enginyeria'], body_style)],
        [Paragraph("Administració", body_style), Paragraph(w_data['administracio'], body_style)],
        [Paragraph("Vendes i Atenció", body_style), Paragraph(f"<b>Vendes:</b> {w_data['vendes']}<br/><b>Atenció al Públic:</b> {w_data['atencio_public']}", body_style)],
        [Paragraph("Modalitat de Treball", body_style), Paragraph(f"<b>Treball Individual:</b> {w_data['treball_individual']}<br/><b>Treball en Equip:</b> {w_data['treball_en_equip']}", body_style)]
    ]
    
    t = Table(table_data, colWidths=[140, 360])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#f1f5f9')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    
    story.append(t)
    story.append(Spacer(1, 15))
    
    # --- Radar Chart ---
    story.append(KeepTogether([
        Paragraph("4. Índexs Grafopsicològics de Competències", h1_style),
        draw_radar_chart(report_data['indexes']),
        Spacer(1, 10)
    ]))
    
    # --- Attention Areas & Strengths ---
    story.append(KeepTogether([
        Paragraph("5. Aspectes a Considerar i Fortaleses", h1_style),
        Paragraph("Fortaleses positives destacables:", h2_style)
    ]))
    for str_item in report_data['fortaleses']:
        story.append(Paragraph(f"• {str_item}", bullet_style))
        
    story.append(Spacer(1, 5))
    story.append(Paragraph("Aspectes que podrien requerir atenció o acompanyament:", h2_style))
    for att_item in report_data['aspectes_atencio']:
        story.append(Paragraph(f"• {att_item}", bullet_style))
        
    story.append(Spacer(1, 10))
    
    # --- Recommendations ---
    rec_data = report_data['recomanacions']
    story.append(KeepTogether([
        Paragraph("6. Orientacions i Recomanacions", h1_style),
        Paragraph(f"<b>Entorns de treball compatibles:</b> {rec_data['entorns_compatibles']}", body_style),
        Paragraph(f"<b>Estil de lideratge més adequat:</b> {rec_data['estil_lideratge']}", body_style),
        Paragraph(f"<b>Forma de comunicació recomanada:</b> {rec_data['forma_comunicacio']}", body_style),
        Paragraph(f"<b>Factors motivadors:</b> {rec_data['factors_motivadors']}", body_style)
    ]))
    
    # --- Legal Disclaimer ---
    disclaimer_text = (
        "<b>Nota de descàrrec:</b> Les conclusions presentades en aquest informe constitueixen exclusivament interpretacions "
        "grafopsicològiques basades en la grafologia clàssica europea. No s'han de considerar fets provats ni diagnòstics. "
        "Aquesta anàlisi té finalitats d'orientació personal o professional i no s'ha d'utilitzar com a substitut de criteris "
        "mèdics, clínics, de salut mental o de valoracions professionals legals."
    )
    story.append(Spacer(1, 15))
    story.append(Paragraph(disclaimer_text, legal_style))
    
    # Build Document
    doc.build(story)
