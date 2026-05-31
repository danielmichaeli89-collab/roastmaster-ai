"""
Nocture — photoreal coffee bar & audiophile room, built procedurally in Blender,
rendered with Cycles (path tracer) + OpenImageDenoise.

Reference target: a narrow ~4m x 7m space. Bar on the RIGHT clad in dark green
vertical stack tile, dark terrazzo counter + floor, black La Marzocco-style
espresso machine, conical grinder, brass gooseneck tap, backlit shelf of coffee
jars. Oak-slat SEATING wall on the LEFT with a banquette, small round black
tables + stools, a plant. SPEAKER (audiophile) wall at the far end. Warm 2700K
cove + toe-kick LED, ceiling track spots. Moody, high-contrast, photoreal.

Coordinate convention (Blender, Z up):
  X: 0 (left/seating wall) .. 4 (right/bar wall)
  Y: 0 (entrance / near) .. 7 (speaker wall / far)
  Z: 0 (floor) .. 3.0 (ceiling)

Usage:
  python3 blender/nocture_scene.py -- --camera counter_hero --res 1600x900 \
      --samples 96 --out /tmp/hero.jpg
"""
import bpy, bmesh, math, sys, argparse, random
from mathutils import Vector, Euler

# ----------------------------------------------------------------------------- args
argv = sys.argv
argv = argv[argv.index("--") + 1:] if "--" in argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--camera", default="counter_hero")
ap.add_argument("--res", default="1600x900")
ap.add_argument("--samples", type=int, default=96)
ap.add_argument("--out", default="/tmp/hero.jpg")
ap.add_argument("--pano", action="store_true")
ap.add_argument("--haze", action="store_true", help="add volumetric atmosphere (slow; hero shots only)")
args = ap.parse_args(argv)
W, H = (int(x) for x in args.res.split("x"))
random.seed(7)

# ----------------------------------------------------------------------------- helpers
def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def srgb(r, g, b):
    """Convert 0-255 sRGB to linear for Blender."""
    def c(v):
        v /= 255.0
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return (c(r), c(g), c(b), 1.0)

def set_in(bsdf, name, value):
    if name in bsdf.inputs:
        bsdf.inputs[name].default_value = value
        return True
    return False

def principled(name, base, metallic=0.0, rough=0.5, ior=1.45, coat=0.0,
               coat_rough=0.03, transmission=0.0, emission=None, emission_str=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    set_in(bsdf, "Base Color", base)
    set_in(bsdf, "Metallic", metallic)
    set_in(bsdf, "Roughness", rough)
    set_in(bsdf, "IOR", ior)
    set_in(bsdf, "Coat Weight", coat)
    set_in(bsdf, "Coat Roughness", coat_rough)
    set_in(bsdf, "Transmission Weight", transmission)
    if emission is not None:
        set_in(bsdf, "Emission Color", emission)
        set_in(bsdf, "Emission Strength", emission_str)
    return mat

def emission_mat(name, color, strength):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = color
    em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return mat

def _add_bevel(o, width=0.002, segments=2):
    """Add a small bevel modifier. This is the single biggest quality boost we
    can apply procedurally — real edges catch the rim of every light."""
    m = o.modifiers.new(name='Bevel', type='BEVEL')
    m.width = width
    m.segments = segments
    m.limit_method = 'ANGLE'
    m.angle_limit = math.radians(30)

def box(name, size, loc, mat=None, rot=(0, 0, 0), bevel=True):
    # primitive_cube_add(size=1) already spans 1 unit, so scale by the full size
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = (size[0], size[1], size[2])
    o.rotation_euler = Euler(rot)
    if mat:
        o.data.materials.append(mat)
    bpy.ops.object.transform_apply(scale=True, rotation=False, location=False)
    if bevel and min(size) > 0.05:
        _add_bevel(o, width=min(0.0035, min(size)*0.04))
    return o

def cyl(name, r, depth, loc, mat=None, rot=(0, 0, 0), verts=48, bevel=True):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, vertices=verts)
    o = bpy.context.active_object
    o.name = name
    o.rotation_euler = Euler(rot)
    if mat:
        o.data.materials.append(mat)
    if bevel and r > 0.03:
        _add_bevel(o, width=min(0.0025, r*0.04))
    return o

def shade_smooth(o):
    for p in o.data.polygons:
        p.use_smooth = True

# ----------------------------------------------------------------------------- materials
def make_terrazzo(name, base_rgb, light=False):
    """Dark terrazzo: stone base with scattered light chips, polished clearcoat."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    set_in(bsdf, "Roughness", 0.4)
    set_in(bsdf, "Coat Weight", 0.18)
    set_in(bsdf, "Coat Roughness", 0.22)

    tex = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (6, 6, 6)
    nt.links.new(tex.outputs["Object"], mapping.inputs["Vector"])

    # Voronoi "Color" gives a flat random colour per cell — ramp most cells to the
    # dark base and only a few to light chips. (Distance thresholding was unreliable.)
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.feature = 'F1'
    vor.inputs["Scale"].default_value = 40.0
    nt.links.new(mapping.outputs["Vector"], vor.inputs["Vector"])
    # use the per-cell random scalar to pick chip vs base
    sep = nt.nodes.new("ShaderNodeSeparateColor")
    nt.links.new(vor.outputs["Color"], sep.inputs["Color"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = 'CONSTANT'
    # 0..0.7 -> dark base ; 0.7..0.88 -> mid chip ; 0.88..1 -> light chip
    e = ramp.color_ramp.elements
    e[0].position = 0.0;  e[0].color = base_rgb
    e[1].position = 0.72; e[1].color = srgb(96, 92, 86)
    ramp.color_ramp.elements.new(0.88);
    ramp.color_ramp.elements[2].color = srgb(170, 165, 156) if not light else srgb(220, 216, 208)
    nt.links.new(sep.outputs["Red"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    # subtle bump
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 180.0
    nt.links.new(mapping.outputs["Vector"], noise.inputs["Vector"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.04
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat

def make_green_tile(name):
    """Dark forest-green vertical stack tile, glossy glaze, grout lines."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    tex = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    # tall thin tiles (vertical stack): scale Y more than X
    mapping.inputs["Scale"].default_value = (10, 4, 1)
    nt.links.new(tex.outputs["Object"], mapping.inputs["Vector"])

    brick = nt.nodes.new("ShaderNodeTexBrick")
    brick.offset = 0.0  # stack bond (aligned, not running)
    brick.inputs["Color1"].default_value = srgb(28, 54, 44)
    brick.inputs["Color2"].default_value = srgb(34, 62, 50)
    brick.inputs["Mortar"].default_value = srgb(12, 20, 17)
    brick.inputs["Scale"].default_value = 1.0
    brick.inputs["Mortar Size"].default_value = 0.012
    brick.inputs["Brick Width"].default_value = 0.5
    brick.inputs["Row Height"].default_value = 0.25
    nt.links.new(mapping.outputs["Vector"], brick.inputs["Vector"])
    nt.links.new(brick.outputs["Color"], bsdf.inputs["Base Color"])

    set_in(bsdf, "Roughness", 0.12)
    set_in(bsdf, "Coat Weight", 0.85)
    set_in(bsdf, "Coat Roughness", 0.04)
    # grout recess bump from brick Fac
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.25
    bump.inputs["Distance"].default_value = 0.01
    nt.links.new(brick.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat

def make_oak(name, tone=(150, 110, 70)):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    base = srgb(*tone)
    set_in(bsdf, "Base Color", base)
    set_in(bsdf, "Roughness", 0.42)
    set_in(bsdf, "Coat Weight", 0.15)
    tex = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (2, 50, 2)  # long grain along Y
    nt.links.new(tex.outputs["Object"], mapping.inputs["Vector"])
    wave = nt.nodes.new("ShaderNodeTexWave")
    wave.wave_type = 'BANDS'
    wave.inputs["Scale"].default_value = 2.0
    wave.inputs["Distortion"].default_value = 6.0
    wave.inputs["Detail"].default_value = 3.0
    nt.links.new(mapping.outputs["Vector"], wave.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = srgb(int(tone[0]*0.7), int(tone[1]*0.66), int(tone[2]*0.6))
    ramp.color_ramp.elements[1].color = base
    nt.links.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    return mat

def make_art(name):
    """A dark, moody abstract for the framed prints — a noisy ink wash in muted
    bronze/green so it reads as art, not a glowing oak panel."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    set_in(bsdf, "Roughness", 0.85)
    tex = nt.nodes.new("ShaderNodeTexCoord")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 3.5
    nz.inputs["Detail"].default_value = 8.0
    nz.inputs["Roughness"].default_value = 0.7
    nt.links.new(tex.outputs["Object"], nz.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    el = ramp.color_ramp.elements
    el[0].position = 0.30; el[0].color = srgb(14, 16, 14)
    el[1].position = 0.62; el[1].color = srgb(58, 50, 34)
    ramp.color_ramp.elements.new(0.85)
    ramp.color_ramp.elements[2].color = srgb(120, 96, 56)
    nt.links.new(nz.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    return mat

def make_appliance_black(name):
    """A nuanced black for the espresso machine / grinder body. Mixes a soft
    matte base with a thin clearcoat that the Pointiness attribute drives —
    convex edges read brighter than flat panels, exactly how anodised metal
    appliances catch room light."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    set_in(bsdf, "Base Color", srgb(14,14,16))
    set_in(bsdf, "Metallic", 0.0)
    set_in(bsdf, "IOR", 1.55)

    # Pointiness → edge-aware coat (only edges and slight curvature get gloss)
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    pmap = nt.nodes.new("ShaderNodeMapRange")
    pmap.inputs["From Min"].default_value = 0.42
    pmap.inputs["From Max"].default_value = 0.62
    pmap.inputs["To Min"].default_value = 0.0
    pmap.inputs["To Max"].default_value = 0.55
    nt.links.new(geo.outputs["Pointiness"], pmap.inputs["Value"])
    nt.links.new(pmap.outputs["Result"], bsdf.inputs["Coat Weight"])
    set_in(bsdf, "Coat Roughness", 0.10)

    # micro-roughness from a noise so it doesn't read perfectly uniform
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 280.0
    noise.inputs["Detail"].default_value = 2.0
    rmap = nt.nodes.new("ShaderNodeMapRange")
    rmap.inputs["From Min"].default_value = 0.2
    rmap.inputs["From Max"].default_value = 0.8
    rmap.inputs["To Min"].default_value = 0.36
    rmap.inputs["To Max"].default_value = 0.44
    nt.links.new(noise.outputs["Fac"], rmap.inputs["Value"])
    nt.links.new(rmap.outputs["Result"], bsdf.inputs["Roughness"])

    return mat

# Materials are created AFTER clear_scene() (factory reset wipes datablocks).
M = {}

def make_materials():
    M['floor']   = make_terrazzo("Terrazzo_Floor", srgb(20, 19, 18))
    M["counter"] = make_terrazzo("Terrazzo_Top",  srgb(20, 19, 18))
    M['tile']    = make_green_tile("GreenTile")
    M['oak']     = make_oak("Oak", (150, 112, 72))
    M['oak_dark']= make_oak("OakDark", (96, 70, 46))
    M['black_matte'] = principled("BlackMatte", srgb(14,14,15), metallic=0.1, rough=0.55)
    M['black_satin'] = principled("BlackSatin", srgb(20,20,22), metallic=0.4, rough=0.32, coat=0.3)
    # sleek appliance black — reads its form through soft highlights, not flat
    M["black_deep"]  = make_appliance_black("BlackDeep")
    M['chrome'] = principled("Chrome", srgb(232,232,235), metallic=1.0, rough=0.06)
    M['brass']  = principled("Brass", srgb(196,150,80), metallic=1.0, rough=0.18)
    M['steel']  = principled("Steel", srgb(180,180,184), metallic=1.0, rough=0.25)
    M['glass']  = principled("Glass", srgb(250,250,250), rough=0.02, transmission=1.0, ior=1.45)
    M['beans']  = principled("Beans", srgb(40,22,12), rough=0.5)
    M['ceiling']= principled("Ceiling", srgb(16,15,15), rough=0.85)
    M['wall_dark']= principled("WallDark", srgb(22,22,22), rough=0.8)
    M['felt_green']= principled("FeltGreen", srgb(18,30,26), rough=0.9)
    M['leaf']   = principled("Leaf", srgb(26,44,26), rough=0.42, transmission=0.12, coat=0.18, coat_rough=0.25)
    M['led']    = emission_mat("LED2700", srgb(255, 196, 120), 22.0)
    M['led_soft']= emission_mat("LEDsoft", srgb(255, 188, 120), 9.0)
    M['lamp_hot']= emission_mat("LampHot", srgb(255, 210, 150), 60.0)
    M['badge']   = emission_mat("Badge", srgb(255, 200, 130), 0.9)
    M['screen_b']= emission_mat("ScreenB", srgb(120, 170, 255), 1.4)
    M['speaker_cone']= principled("Cone", srgb(180,176,168), rough=0.8)
    M['art']     = make_art("Art")

ROOM_W = 4.0
ROOM_L = 7.0
ROOM_H = 3.0

# ----------------------------------------------------------------------------- shell
def build_shell():
    # Floor
    f = box("Floor", (ROOM_W, ROOM_L, 0.1), (ROOM_W/2, ROOM_L/2, -0.05), M['floor'])
    # Ceiling
    box("Ceiling", (ROOM_W, ROOM_L, 0.1), (ROOM_W/2, ROOM_L/2, ROOM_H+0.05), M['ceiling'])
    # Left wall (seating side) — base dark, oak slats added separately
    box("WallL", (0.1, ROOM_L, ROOM_H), (-0.05, ROOM_L/2, ROOM_H/2), M['wall_dark'])
    # Right wall (bar side) — green tile
    box("WallR", (0.1, ROOM_L, ROOM_H), (ROOM_W+0.05, ROOM_L/2, ROOM_H/2), M['tile'])
    # Far wall (speaker) — dark
    box("WallFar", (ROOM_W, 0.1, ROOM_H), (ROOM_W/2, ROOM_L+0.05, ROOM_H/2), M['wall_dark'])
    # Near wall behind camera — dark
    box("WallNear", (ROOM_W, 0.1, ROOM_H), (ROOM_W/2, -0.05, ROOM_H/2), M['wall_dark'])

    # Ceiling warm cove panel running down center-left
    cove = box("CovePanel", (0.5, ROOM_L-1.0, 0.04), (1.4, ROOM_L/2, ROOM_H-0.06), M['led_soft'])
    # recessed dark frame around it
    box("CoveFrame", (0.7, ROOM_L-0.8, 0.12), (1.4, ROOM_L/2, ROOM_H-0.02), M['ceiling'])
    box("CovePanel2", (0.5, ROOM_L-1.0, 0.04), (1.4, ROOM_L/2, ROOM_H-0.07), M['led_soft'])

def build_track_spots():
    # ceiling track over the bar (right side) with warm spot pucks + real area lights
    xs = 3.2
    for i, y in enumerate([1.3, 2.3, 3.3, 4.3, 5.3]):
        cyl(f"Puck{i}", 0.05, 0.08, (xs, y, ROOM_H-0.06), M['black_satin'])
        cyl(f"PuckLens{i}", 0.035, 0.02, (xs, y, ROOM_H-0.11), M['lamp_hot'])
        # real light
        light_data = bpy.data.lights.new(f"SpotL{i}", type='SPOT')
        light_data.energy = 130
        light_data.spot_size = math.radians(78)
        light_data.spot_blend = 0.6
        light_data.color = (1.0, 0.72, 0.45)
        light_data.shadow_soft_size = 0.08
        lo = bpy.data.objects.new(f"SpotL{i}", light_data)
        lo.location = (xs, y, ROOM_H-0.12)
        lo.rotation_euler = (math.radians(8), 0, 0)
        bpy.context.scene.collection.objects.link(lo)

def build_cove_lights():
    # left wall top cove (warm wash down the oak slats)
    box("CoveLstrip", (0.06, ROOM_L-1.0, 0.05), (0.16, ROOM_L/2, ROOM_H-0.22), M['led'])
    # area light to push the wash
    ld = bpy.data.lights.new("CoveAreaL", type='AREA')
    ld.shape='RECTANGLE'; ld.size=0.2; ld.size_y=ROOM_L-1.0; ld.energy=140; ld.color=(1.0,0.74,0.46)
    lo = bpy.data.objects.new("CoveAreaL", ld); lo.location=(0.3, ROOM_L/2, ROOM_H-0.25)
    lo.rotation_euler=(0, math.radians(70), 0); bpy.context.scene.collection.objects.link(lo)
    # bar toe-kick glow (floor wash along bar base)
    box("ToeKick", (0.05, 3.6, 0.04), (2.62, 3.4, 0.06), M['led'])
    ld2 = bpy.data.lights.new("ToeArea", type='AREA')
    ld2.shape='RECTANGLE'; ld2.size=0.1; ld2.size_y=3.6; ld2.energy=22; ld2.color=(1.0,0.72,0.45)
    lo2 = bpy.data.objects.new("ToeArea", ld2); lo2.location=(2.5, 3.4, 0.08)
    lo2.rotation_euler=(0, math.radians(-80), 0); bpy.context.scene.collection.objects.link(lo2)

# ----------------------------------------------------------------------------- bar
def build_bar():
    # bar runs along the right (X ~2.65..3.5), Y 1.4..5.6
    bx0, bx1 = 2.65, 3.5
    by0, by1 = 1.4, 5.6
    cx = (bx0+bx1)/2; cy=(by0+by1)/2; depth=bx1-bx0; length=by1-by0
    # green-tiled bar front (faces walkway, -X side)
    box("BarFront", (0.04, length, 1.05), (bx0, cy, 0.525), M['tile'])
    # bar body
    box("BarBody", (depth, length, 1.0), (cx, cy, 0.5), M['black_matte'])
    # terrazzo top with slight overhang
    box("BarTop", (depth+0.12, length+0.06, 0.05), (cx-0.02, cy, 1.04), M['counter'])

    # backbar: tiled wall already (right wall). Add a long backlit shelf with jars.
    sx = bx1 + 0.18
    box("ShelfBoard", (0.22, length-0.2, 0.04), (sx, cy, 1.85), M['oak'])
    # under-shelf LED
    box("ShelfLED", (0.2, length-0.3, 0.025), (sx-0.02, cy, 1.80), M['led'])
    ld = bpy.data.lights.new("ShelfArea", type='AREA')
    ld.shape='RECTANGLE'; ld.size=0.18; ld.size_y=length-0.3; ld.energy=46; ld.color=(1.0,0.76,0.5)
    lo = bpy.data.objects.new("ShelfArea", ld); lo.location=(sx-0.1, cy, 1.74)
    lo.rotation_euler=(0, math.radians(95), 0); bpy.context.scene.collection.objects.link(lo)
    # coffee jars on the shelf
    for i, y in enumerate([by0+0.3 + k*0.42 for k in range(9)]):
        if y > by1-0.2: break
        jar = cyl(f"Jar{i}", 0.07, 0.22, (sx, y, 1.98), M['glass'])
        shade_smooth(jar)
        cyl(f"JarBeans{i}", 0.062, 0.14, (sx, y, 1.94), M['beans'])
        cyl(f"JarLid{i}", 0.072, 0.03, (sx, y, 2.10), M['oak_dark'])

    # espresso machine (La Marzocco Strada-style) centered on bar
    build_espresso((cx-0.02, 3.05, 1.065))
    # grinder to its right
    build_grinder((cx+0.0, 3.95, 1.065))
    # brass gooseneck tap + sink toward the front
    build_tap((cx+0.08, 2.0, 1.065))
    # lived-in props
    build_bar_props(cx, cy)
    # Lighting on the espresso area is carried by the existing track spots and
    # under-shelf strip — no dedicated key/rim, which were washing the machine
    # to cream regardless of base colour.

def build_espresso(loc):
    """La Marzocco Strada EP, 2-group, paddle-actuated. Front faces -X (walkway)."""
    x, y, z = loc
    BW = 0.78   # width along Y (bar length)
    BD = 0.52   # depth along X
    # main body — deep matte black, raised off a dark base tray
    box("EspTray", (BD+0.04, BW+0.04, 0.03), (x, y, z+0.015), M['black_matte'])
    body = box("EspBody", (BD, BW, 0.34), (x, y, z+0.21), M['black_deep'])
    # strong rounding on the body — LM Strada has soft 12mm radii, not hard edges
    for m in list(body.modifiers):
        body.modifiers.remove(m)
    _add_bevel(body, width=0.014, segments=4)
    # rounded shoulder / top
    sh = box("EspShoulder", (BD-0.06, BW, 0.10), (x, y, z+0.42), M['black_deep'])
    for m in list(sh.modifiers):
        sh.modifiers.remove(m)
    _add_bevel(sh, width=0.018, segments=4)
    # raised rear cup rail
    box("EspRear", (0.16, BW, 0.16), (x+0.18, y, z+0.50), M['black_deep'])
    # polished front fascia panel (no emission — keeps the body reading black)
    box("EspFascia", (0.02, BW-0.06, 0.2), (x-BD/2-0.005, y, z+0.20), M['black_deep'])

    # two group heads protruding toward -X, with portafilters locked in
    for i, gy in enumerate([y-0.17, y+0.17]):
        # group neck
        cyl(f"Grp{i}", 0.052, 0.16, (x-BD/2-0.04, gy, z+0.14), M['chrome'], rot=(0, math.radians(90), 0))
        cyl(f"GrpTop{i}", 0.06, 0.05, (x-BD/2+0.02, gy, z+0.14), M['black_satin'], rot=(0, math.radians(90), 0))
        # portafilter: chrome basket + black handle angled down-forward
        cyl(f"PFbasket{i}", 0.044, 0.05, (x-BD/2-0.10, gy, z+0.115), M['chrome'], rot=(0, math.radians(90), 0))
        cyl(f"PFspout{i}", 0.012, 0.04, (x-BD/2-0.10, gy, z+0.075), M['chrome'])
        cyl(f"PFhandle{i}", 0.016, 0.17, (x-BD/2-0.24, gy, z+0.075), M['black_matte'], rot=(0, math.radians(64), 0))
        cyl(f"PFhandleEnd{i}", 0.02, 0.03, (x-BD/2-0.32, gy, z+0.04), M['steel'], rot=(0, math.radians(64), 0))
        # paddle lever above each group (Strada paddle)
        box(f"Paddle{i}", (0.10, 0.05, 0.018), (x-0.05, gy, z+0.40), M['steel'], rot=(0, math.radians(12), 0))
        # group pressure detail ring
        cyl(f"GrpRing{i}", 0.058, 0.01, (x-BD/2-0.005, gy, z+0.14), M['brass'], rot=(0, math.radians(90), 0))
    # central pressure gauge on top
    cyl("Gauge", 0.045, 0.03, (x, y, z+0.48), M['steel'])
    cyl("GaugeFace", 0.038, 0.005, (x, y, z+0.497), M['chrome'])
    # steam wands on both ends + a knob each
    for sy, s in ((y-BW/2-0.02, -1), (y+BW/2+0.02, 1)):
        cyl("Wand", 0.009, 0.26, (x-0.18, sy, z+0.12), M['chrome'], rot=(math.radians(22*s), 0, 0))
        cyl("WandTip", 0.012, 0.04, (x-0.18, sy+0.10*s, z+0.02), M['steel'], rot=(math.radians(22*s),0,0))
        cyl("SteamKnob", 0.022, 0.03, (x+0.05, sy, z+0.30), M['black_matte'], rot=(0, math.radians(90), 0))
    # tiny warm LM badge slot — just a hint, not a glowing panel
    box("EspBadge", (0.008, 0.06, 0.014), (x-BD/2-0.012, y, z+0.30), M["badge"])
    # brushed-steel control trim panel under the cup rail (catches highlights)
    box("EspTrim", (0.02, BW-0.16, 0.012), (x-BD/2-0.014, y, z+0.355), M['steel'])
    # cups warming on the top rail (varied heights for visual interest)
    for j, cy2 in enumerate([y-0.27, y-0.10, y+0.07, y+0.24]):
        cyl(f"WarmCup{j}", 0.036, 0.045, (x+0.12, cy2, z+0.585), M['black_satin'], verts=32)
        cyl(f"WarmSaucer{j}", 0.05, 0.005, (x+0.12, cy2, z+0.585+0.024), M['chrome'], verts=32)
    # drip tray detail — a thin bright rim along the front-bottom of the body
    box("EspDripLip", (BD-0.10, BW-0.04, 0.008), (x, y, z+0.05), M['chrome'])

def build_grinder(loc):
    """Tall on-demand grinder (Mythos/Mazzer-style), front faces -X."""
    x, y, z = loc
    box("GrBase", (0.2, 0.22, 0.1), (x, y, z+0.05), M['black_deep'])
    body = box("GrBody", (0.17, 0.18, 0.42), (x, y, z+0.30), M['black_deep'])
    # forks where the portafilter rests
    box("GrFork", (0.06, 0.12, 0.012), (x-0.10, y, z+0.20), M['steel'])
    # chute throat
    cyl("GrChute", 0.028, 0.07, (x-0.085, y, z+0.27), M['black_matte'], rot=(0, math.radians(90), 0))
    # display screen (blue glow)
    box("GrScreen", (0.012, 0.10, 0.05), (x-0.086, y, z+0.40), M['black_matte'])
    scr = emission_mat("GrScreenGlow", srgb(120, 170, 255), 0.7)
    box("GrScreenGlow", (0.006, 0.085, 0.038), (x-0.092, y, z+0.40), scr)
    # collar + clear hopper with beans
    cyl("GrCollar", 0.085, 0.05, (x, y, z+0.55), M['black_deep'])
    hop = cyl("GrHopper", 0.075, 0.22, (x, y, z+0.69), M['glass'], verts=48); shade_smooth(hop)
    cyl("GrBeans", 0.066, 0.14, (x, y, z+0.66), M['beans'])
    cyl("GrLid", 0.078, 0.025, (x, y, z+0.81), M['black_satin'])

def build_tap(loc):
    """Brass gooseneck tap over a small recessed sink. Smooth arc via segments."""
    x, y, z = loc
    cyl("TapBase", 0.03, 0.02, (x, y, z+0.01), M['brass'])
    cyl("TapStem", 0.016, 0.30, (x, y, z+0.16), M['brass'])
    # gooseneck arc (quarter turn from vertical to pointing -X)
    seg = 7
    R = 0.10
    for i in range(seg):
        a0 = (math.pi/2) * (i / seg)
        ax = x - R*(1-math.cos(a0))
        az = z + 0.31 + R*math.sin(a0)
        cyl(f"TapArc{i}", 0.014, 0.05, (ax, y, az), M['brass'], rot=(0, a0, 0))
    cyl("TapSpout", 0.012, 0.06, (x-R-0.02, y, z+0.30), M['brass'], rot=(0, math.radians(90), 0))
    # lever handle
    cyl("TapLever", 0.01, 0.09, (x+0.03, y, z+0.20), M['brass'], rot=(0, math.radians(55), 0))
    # recessed sink basin (dark steel)
    box("SinkRim", (0.3, 0.4, 0.015), (x-0.04, y, z+0.005), M['steel'])
    box("SinkWell", (0.24, 0.34, 0.02), (x-0.04, y, z-0.02), M['black_matte'])

def build_bar_props(cx, cy):
    """Small lived-in details on the counter near the front working area."""
    z = 1.09
    # a portafilter resting on a knock-tube near the espresso machine
    cyl("KnockTube", 0.06, 0.16, (cx-0.05, 2.55, z+0.08), M['black_matte'])
    cyl("KnockBar", 0.008, 0.12, (cx-0.05, 2.55, z+0.17), M['black_matte'], rot=(math.radians(90),0,0))
    # tamper on a mat
    box("TampMat", (0.18, 0.14, 0.008), (cx-0.02, 4.45, z+0.004), M['black_matte'])
    cyl("TampBase", 0.029, 0.018, (cx-0.02, 4.45, z+0.02), M['steel'])
    cyl("TampHandle", 0.022, 0.06, (cx-0.02, 4.45, z+0.05), M['oak_dark'])
    # milk pitcher (stainless)
    cyl("Pitcher", 0.05, 0.12, (cx-0.1, 4.7, z+0.06), M['steel'], verts=32)
    box("PitcherSpout", (0.03, 0.04, 0.03), (cx-0.16, 4.7, z+0.10), M['steel'], rot=(0, math.radians(30), 0))
    # a couple of finished espresso cups + saucers on the front of the bar
    for i, yy in enumerate([1.7, 1.95]):
        cyl(f"Saucer{i}", 0.05, 0.008, (cx-0.16, yy, z+0.004), M['black_satin'], verts=40)
        cyl(f"DemiCup{i}", 0.032, 0.04, (cx-0.16, yy, z+0.025), M['black_satin'], verts=32)
    # paper menu card
    box("Menu", (0.1, 0.16, 0.004), (cx-0.18, 5.2, z+0.002), M['oak'], rot=(0,0,math.radians(18)))

    # acaia-style barista scale (black pad + bright readout) under the grinder chute
    box("Scale", (0.13, 0.13, 0.02), (cx-0.02, 3.95, z+0.01), M['black_satin'])
    sgl = emission_mat("ScaleGlow", srgb(150, 200, 255), 1.1)
    box("ScaleScreen", (0.05, 0.025, 0.001), (cx-0.06, 3.92, z+0.021), sgl)
    # folded bar cloth draped near the steam wand
    box("Cloth", (0.12, 0.16, 0.02), (cx-0.05, 2.85, z+0.01), M['felt_green'], rot=(0,0,math.radians(-10)))
    # a scatter of coffee beans by the grinder
    random.seed(21)
    for i in range(14):
        bx = cx - 0.02 + random.uniform(-0.14, 0.14)
        by = 3.95 + random.uniform(-0.16, 0.16)
        bn = cyl(f"Bean{i}", 0.006, 0.01, (bx, by, z+0.006),
                 M['beans'], rot=(random.uniform(0,3), random.uniform(0,3), random.uniform(0,3)), verts=8, bevel=False)
        bn.scale = (1.0, 1.5, 0.7)
    # small stack of folded napkins
    for i in range(4):
        box(f"Napkin{i}", (0.1, 0.1, 0.006), (cx+0.05, 5.0, z+0.004 + i*0.007), M['oak'], rot=(0,0,math.radians(i*3)))

# ----------------------------------------------------------------------------- seating (left)
def build_seating():
    # oak slat wall on the left (vertical battens)
    n = 26
    for i in range(n):
        yy = 0.6 + i * ((ROOM_L-1.2)/(n-1))
        box(f"Slat{i}", (0.04, 0.05, ROOM_H-1.1), (0.12, yy, (ROOM_H-1.1)/2+0.55), M['oak'])
    # banquette bench
    box("Bench", (0.55, ROOM_L-2.0, 0.12), (0.5, ROOM_L/2-0.2, 0.46), M['oak_dark'])
    box("BenchCush", (0.5, ROOM_L-2.1, 0.08), (0.52, ROOM_L/2-0.2, 0.56), M['black_matte'])
    # under-bench LED
    box("BenchLED", (0.5, ROOM_L-2.3, 0.03), (0.55, ROOM_L/2-0.2, 0.36), M['led'])
    ld = bpy.data.lights.new("BenchArea", type='AREA')
    ld.shape='RECTANGLE'; ld.size=0.4; ld.size_y=ROOM_L-2.3; ld.energy=26; ld.color=(1.0,0.74,0.46)
    lo = bpy.data.objects.new("BenchArea", ld); lo.location=(0.7, ROOM_L/2-0.2, 0.32)
    lo.rotation_euler=(math.radians(-90),0,0); bpy.context.scene.collection.objects.link(lo)
    # round bistro tables + stools opposite the bench
    for i, y in enumerate([2.3, 3.5, 4.7]):
        cyl(f"Ttop{i}", 0.27, 0.04, (1.15, y, 0.74), M['black_satin'])
        cyl(f"Tpost{i}", 0.03, 0.72, (1.15, y, 0.38), M['black_matte'])
        cyl(f"Tbase{i}", 0.2, 0.03, (1.15, y, 0.02), M['black_matte'])
        # a stool on the walkway side
        cyl(f"Stool{i}", 0.16, 0.05, (1.7, y, 0.62), M['black_satin'])
        cyl(f"StoolP{i}", 0.025, 0.6, (1.7, y, 0.31), M['black_matte'])
    # a plant near the front
    build_plant((1.2, 1.3, 0))

def _make_leaf(name, length, width, mat):
    """A single curved leaf as a low-poly strip, gently cupped along its length."""
    bm = bmesh.new()
    segs = 5
    verts_l, verts_r = [], []
    for i in range(segs + 1):
        t = i / segs
        # taper to a point at both ends, widest in the middle-third
        w = width * math.sin(min(1.0, t * 1.15) * math.pi) ** 0.7
        # cup + droop
        z = -0.10 * length * (t ** 1.6) + 0.04 * length * math.sin(t * math.pi)
        verts_l.append(bm.verts.new((-w / 2, t * length, z + 0.01 * w)))
        verts_r.append(bm.verts.new((w / 2, t * length, z + 0.01 * w)))
    for i in range(segs):
        bm.faces.new((verts_l[i], verts_r[i], verts_r[i + 1], verts_l[i + 1]))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(mat)
    shade_smooth(o)
    # thin solidify so leaves aren't paper-zero thickness
    sol = o.modifiers.new('Sol', 'SOLIDIFY'); sol.thickness = 0.004
    return o

def build_plant(loc):
    """A potted leafy plant built from many individual curved leaves radiating
    from a few stems — reads as real foliage, not blobs."""
    x, y, z = loc
    # tapered pot
    cyl("Pot", 0.19, 0.46, (x, y, z+0.23), M['black_matte'])
    cyl("PotRim", 0.205, 0.05, (x, y, z+0.45), M['black_satin'])
    cyl("Soil", 0.17, 0.03, (x, y, z+0.46), M['black_matte'])
    random.seed(11)
    # several arching stems, each carrying a fan of leaves
    n_stems = 6
    for s in range(n_stems):
        base_ang = (s / n_stems) * math.tau + random.uniform(-0.3, 0.3)
        lean = random.uniform(0.15, 0.5)
        stem_h = random.uniform(0.5, 0.95)
        sx = x + math.cos(base_ang) * 0.04
        sy = y + math.sin(base_ang) * 0.04
        # leaves along the stem
        n_leaves = random.randint(4, 6)
        for l in range(n_leaves):
            t = (l + 1) / (n_leaves + 1)
            lz = z + 0.47 + stem_h * t
            length = random.uniform(0.22, 0.4) * (1.15 - 0.4 * t)
            width = length * random.uniform(0.26, 0.4)
            leaf = _make_leaf(f"Leaf_{s}_{l}", length, width, M['leaf'])
            leaf.location = (sx + math.cos(base_ang) * lean * t,
                             sy + math.sin(base_ang) * lean * t, lz)
            # orient outward + random roll, drooping tips
            leaf.rotation_euler = (
                math.radians(random.uniform(35, 75)),
                random.uniform(-0.4, 0.4),
                base_ang + random.uniform(-0.5, 0.5),
            )
            leaf.scale = (1, 1, 1)

# ----------------------------------------------------------------------------- speaker wall (far)
def build_speaker_wall():
    cx = ROOM_W/2; y = ROOM_L-0.12
    # central black recessed baffle, slightly inset
    box("SpkBaffle", (1.05, 0.10, 2.2), (cx, y, 1.25), M['black_matte'])
    # green felt acoustic backing visible at edges
    box("SpkFelt", (0.85, 0.04, 2.05), (cx, y-0.03, 1.25), M['felt_green'])
    # drivers — 4 woofers stacked + horn tweeter at the very top
    z_woofers = [0.55, 1.05, 1.55, 2.05]
    for i, zz in enumerate(z_woofers):
        r = 0.20
        # recessed mounting ring (slightly proud black)
        cyl(f"DrvRing{i}", r+0.018, 0.018, (cx, y-0.06, zz), M['black_matte'], rot=(math.radians(90),0,0))
        # surround / basket
        cyl(f"DrvBasket{i}", r, 0.05, (cx, y-0.07, zz), M['black_satin'], rot=(math.radians(90),0,0))
        # the paper cone (slightly off-white)
        cyl(f"DrvCone{i}", r*0.78, 0.022, (cx, y-0.10, zz), M['speaker_cone'], rot=(math.radians(90),0,0))
        # dust cap
        cyl(f"DrvCap{i}", r*0.30, 0.038, (cx, y-0.12, zz), M['black_matte'], rot=(math.radians(90),0,0))
    # horn tweeter slot (above woofers)
    box("HornBody", (0.4, 0.05, 0.16), (cx, y-0.05, 2.6), M['black_matte'])
    box("HornMouth", (0.36, 0.02, 0.12), (cx, y-0.08, 2.6), M['black_satin'])

    # flanking oak slat columns (taller, narrower battens)
    for sx in [cx-0.78, cx+0.78]:
        for j in range(6):
            box(f"SpkSlat{sx}{j}", (0.05, 0.06, 2.3), (sx + (j-2.5)*0.07, y-0.03, 1.3), M['oak'])

    # framed art either side of the speaker (vertical rectangles)
    for sx in [cx-1.55, cx+1.55]:
        # frame
        box(f"ArtFrame_{sx}", (0.5, 0.025, 0.65), (sx, y-0.05, 1.45), M['black_satin'])
        # canvas (warm-coloured abstract)
        box(f"ArtCanvas_{sx}", (0.44, 0.005, 0.58), (sx, y-0.07, 1.45), M['art'])

    # warm niche shelves on either side with bottles (lower band)
    for sx in [cx-1.55, cx+1.55]:
        for k, zz in enumerate([0.55, 0.95]):
            box(f"Niche{sx}{k}", (0.5, 0.28, 0.025), (sx, y-0.18, zz), M['oak'])
            box(f"NicheLED{sx}{k}", (0.46, 0.015, 0.012), (sx, y-0.30, zz+0.12), M['led_soft'])
            # 3 bottles per shelf
            for b, bx in enumerate([-0.16, -0.02, 0.14]):
                cyl(f"Bot{sx}{k}{b}", 0.035, 0.24, (sx+bx, y-0.18, zz+0.14), M['glass'])
                cyl(f"BotCap{sx}{k}{b}", 0.024, 0.025, (sx+bx, y-0.18, zz+0.27), M['brass'])

    # subtle pendant fixture in front of the speaker wall (small visible cone)
    cyl("PendantCord", 0.004, 0.7, (cx, y-0.65, 2.7), M['black_matte'])
    cyl("PendantShade", 0.06, 0.12, (cx, y-0.65, 2.35), M['oak_dark'])
    pl = bpy.data.lights.new("PendantL", type='POINT')
    pl.energy=18; pl.color=(1.0,0.78,0.5); pl.shadow_soft_size=0.06
    plo = bpy.data.objects.new("PendantL", pl); plo.location=(cx, y-0.65, 2.28)
    bpy.context.scene.collection.objects.link(plo)

# ----------------------------------------------------------------------------- world + render
def setup_world():
    world = bpy.data.worlds.new("W"); bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = srgb(26, 24, 24)
    bg.inputs["Strength"].default_value = 0.14

def add_atmosphere():
    """A very faint warm volumetric haze in a box that envelops the room. Gives
    light beams body and adds aerial depth — the cinematic 'smoke' of the
    reference. Density is deliberately tiny so it reads as air, not fog."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(ROOM_W/2, ROOM_L/2, ROOM_H/2))
    o = bpy.context.active_object
    o.name = "Atmosphere"
    o.scale = (ROOM_W-0.1, ROOM_L-0.1, ROOM_H-0.1)
    bpy.ops.object.transform_apply(scale=True)
    mat = bpy.data.materials.new("Haze")
    mat.use_nodes = True
    nt = mat.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    vol = nt.nodes.new("ShaderNodeVolumeScatter")
    vol.inputs["Color"].default_value = srgb(255, 224, 188)
    vol.inputs["Density"].default_value = 0.004
    vol.inputs["Anisotropy"].default_value = 0.4
    nt.links.new(vol.outputs["Volume"], out.inputs["Volume"])
    o.data.materials.append(mat)
    # don't let the haze cube catch camera rays as a surface
    o.visible_camera = True  # volume only (no surface shader) so this is fine

def setup_render():
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = args.samples
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 8
    sc.cycles.diffuse_bounces = 3
    sc.cycles.glossy_bounces = 4
    sc.cycles.transmission_bounces = 8
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.render.resolution_x = W
    sc.render.resolution_y = H
    sc.render.image_settings.file_format = 'JPEG'
    sc.render.image_settings.quality = 92
    sc.render.filepath = args.out
    # filmic/AgX tone + warm look
    try:
        sc.view_settings.view_transform = 'AgX'
        sc.view_settings.look = 'AgX - Medium High Contrast'
    except Exception:
        sc.view_settings.view_transform = 'Filmic'
    sc.view_settings.exposure = 0.0
    sc.view_settings.gamma = 1.0

CAMERAS = {
    # name: (location, look_at, focal_mm)
    'counter_hero': ((1.6, 0.6, 1.5), (3.0, 4.5, 1.1), 24),
    'entrance':     ((2.0, 0.7, 1.55), (2.2, 5.5, 1.2), 24),
    'equipment':    ((1.95, 1.75, 1.42), (3.05, 3.15, 1.12), 40),
    'brew_lab':     ((1.7, 5.4, 1.55), (3.05, 3.7, 1.2), 40),
    'seating':      ((2.6, 4.5, 1.45), (0.6, 2.5, 1.0), 30),
    'audiophile':   ((2.0, 3.0, 1.5), (2.0, 7.0, 1.3), 35),
    'operator':     ((3.1, 3.0, 1.55), (1.5, 1.0, 1.0), 28),
}

def place_camera():
    if args.pano:
        cam_data = bpy.data.cameras.new("Cam"); cam_data.type = 'PANO'
        try: cam_data.panorama_type = 'EQUIRECTANGULAR'
        except Exception: cam_data.cycles.panorama_type = 'EQUIRECTANGULAR'
        loc = CAMERAS.get(args.camera, CAMERAS['counter_hero'])[0]
        cam = bpy.data.objects.new("Cam", cam_data)
        cam.location = loc; cam.rotation_euler = (math.radians(90), 0, math.radians(180))
        bpy.context.scene.collection.objects.link(cam)
        bpy.context.scene.camera = cam
        return
    loc, look, mm = CAMERAS.get(args.camera, CAMERAS['counter_hero'])
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = mm
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = (Vector(look) - Vector(loc)).length
    cam_data.dof.aperture_fstop = 4.0
    cam = bpy.data.objects.new("Cam", cam_data)
    cam.location = loc
    bpy.context.scene.collection.objects.link(cam)
    # aim
    direction = Vector(look) - Vector(loc)
    cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.camera = cam

def main():
    clear_scene()
    make_materials()
    setup_world()
    build_shell()
    build_cove_lights()
    build_track_spots()
    build_bar()
    build_seating()
    build_speaker_wall()
    if args.haze:
        add_atmosphere()
    place_camera()
    setup_render()
    print(f"[nocture] rendering {args.camera} {W}x{H} {args.samples}spp -> {args.out}")
    bpy.ops.render.render(write_still=True)
    print("[nocture] done")

if __name__ == "__main__":
    main()
