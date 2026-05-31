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

def box(name, size, loc, mat=None, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    o.rotation_euler = Euler(rot)
    if mat:
        o.data.materials.append(mat)
    bpy.ops.object.transform_apply(scale=True, rotation=False, location=False)
    return o

def cyl(name, r, depth, loc, mat=None, rot=(0, 0, 0), verts=48):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, vertices=verts)
    o = bpy.context.active_object
    o.name = name
    o.rotation_euler = Euler(rot)
    if mat:
        o.data.materials.append(mat)
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
    set_in(bsdf, "Base Color", base_rgb)
    set_in(bsdf, "Roughness", 0.34)
    set_in(bsdf, "Coat Weight", 0.25)
    set_in(bsdf, "Coat Roughness", 0.18)

    tex = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (8, 8, 8)
    nt.links.new(tex.outputs["Object"], mapping.inputs["Vector"])

    # Voronoi chips
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.feature = 'F1'
    vor.inputs["Scale"].default_value = 26.0
    nt.links.new(mapping.outputs["Vector"], vor.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = base_rgb
    ramp.color_ramp.elements[1].position = 0.06
    ramp.color_ramp.elements[1].color = srgb(150, 146, 140) if not light else srgb(210, 206, 198)
    nt.links.new(vor.outputs["Distance"], ramp.inputs["Fac"])
    # Mix chips over base
    mix = nt.nodes.new("ShaderNodeMixRGB")
    mix.blend_type = 'MIX'
    mix.inputs["Fac"].default_value = 0.55
    mix.inputs["Color1"].default_value = base_rgb
    nt.links.new(ramp.outputs["Color"], mix.inputs["Color2"])
    nt.links.new(mix.outputs["Color"], bsdf.inputs["Base Color"])
    # subtle bump
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 220.0
    nt.links.new(mapping.outputs["Vector"], noise.inputs["Vector"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.05
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

# Materials are created AFTER clear_scene() (factory reset wipes datablocks).
M = {}

def make_materials():
    M['floor']   = make_terrazzo("Terrazzo_Floor", srgb(20, 19, 18))
    M['counter'] = make_terrazzo("Terrazzo_Top",  srgb(38, 36, 34))
    M['tile']    = make_green_tile("GreenTile")
    M['oak']     = make_oak("Oak", (150, 112, 72))
    M['oak_dark']= make_oak("OakDark", (96, 70, 46))
    M['black_matte'] = principled("BlackMatte", srgb(14,14,15), metallic=0.1, rough=0.55)
    M['black_satin'] = principled("BlackSatin", srgb(20,20,22), metallic=0.4, rough=0.32, coat=0.3)
    M['chrome'] = principled("Chrome", srgb(232,232,235), metallic=1.0, rough=0.06)
    M['brass']  = principled("Brass", srgb(196,150,80), metallic=1.0, rough=0.18)
    M['steel']  = principled("Steel", srgb(180,180,184), metallic=1.0, rough=0.25)
    M['glass']  = principled("Glass", srgb(250,250,250), rough=0.02, transmission=1.0, ior=1.45)
    M['beans']  = principled("Beans", srgb(40,22,12), rough=0.5)
    M['ceiling']= principled("Ceiling", srgb(16,15,15), rough=0.85)
    M['wall_dark']= principled("WallDark", srgb(22,22,22), rough=0.8)
    M['felt_green']= principled("FeltGreen", srgb(18,30,26), rough=0.9)
    M['leaf']   = principled("Leaf", srgb(30,46,28), rough=0.55)
    M['led']    = emission_mat("LED2700", srgb(255, 196, 120), 22.0)
    M['led_soft']= emission_mat("LEDsoft", srgb(255, 188, 120), 9.0)
    M['lamp_hot']= emission_mat("LampHot", srgb(255, 210, 150), 60.0)
    M['speaker_cone']= principled("Cone", srgb(180,176,168), rough=0.8)

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
    ld2.shape='RECTANGLE'; ld2.size=0.1; ld2.size_y=3.6; ld2.energy=42; ld2.color=(1.0,0.72,0.45)
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
    ld.shape='RECTANGLE'; ld.size=0.18; ld.size_y=length-0.3; ld.energy=70; ld.color=(1.0,0.76,0.5)
    lo = bpy.data.objects.new("ShelfArea", ld); lo.location=(sx-0.1, cy, 1.74)
    lo.rotation_euler=(0, math.radians(95), 0); bpy.context.scene.collection.objects.link(lo)
    # coffee jars on the shelf
    for i, y in enumerate([by0+0.3 + k*0.42 for k in range(9)]):
        if y > by1-0.2: break
        jar = cyl(f"Jar{i}", 0.07, 0.22, (sx, y, 1.98), M['glass'])
        shade_smooth(jar)
        cyl(f"JarBeans{i}", 0.062, 0.14, (sx, y, 1.94), M['beans'])
        cyl(f"JarLid{i}", 0.072, 0.03, (sx, y, 2.10), M['oak_dark'])

    # espresso machine (La Marzocco-style) centered on bar
    build_espresso((cx-0.05, 3.0, 1.07))
    # grinder to its right
    build_grinder((cx-0.02, 3.9, 1.07))
    # brass gooseneck tap + sink toward the front
    build_tap((cx+0.02, 2.0, 1.07))
    # a few cups stacked
    for i in range(4):
        cyl(f"Cup{i}", 0.04, 0.05, (cx-0.18, 4.5, 1.075+ i*0.052), M['black_satin'], verts=32)

def build_espresso(loc):
    x, y, z = loc
    body = box("EspBody", (0.5, 0.62, 0.45), (x, y, z+0.225), M['black_satin'])
    # top dome
    top = box("EspTop", (0.5, 0.5, 0.12), (x, y, z+0.5), M['black_satin'])
    # back panel (dark, not mirror steel — it was glowing)
    box("EspBack", (0.5, 0.04, 0.4), (x, y+0.3, z+0.24), M['black_satin'])
    # two group heads facing the walkway (-X)
    for i, gy in enumerate([y-0.16, y+0.16]):
        cyl(f"Grp{i}", 0.05, 0.12, (x-0.27, gy, z+0.16), M['chrome'], rot=(0, math.radians(90), 0))
        # portafilter handle
        cyl(f"PF{i}", 0.018, 0.16, (x-0.36, gy, z+0.14), M['black_matte'], rot=(0, math.radians(70), 0))
        cyl(f"PFcup{i}", 0.035, 0.04, (x-0.31, gy, z+0.14), M['chrome'], rot=(0, math.radians(90),0))
    # paddles / knobs
    for gy in [y-0.16, y+0.16, y]:
        cyl("Knob", 0.018, 0.04, (x-0.22, gy, z+0.33), M['chrome'], rot=(0,math.radians(90),0))
    # steam wands
    for gy in [y-0.28, y+0.28]:
        cyl("Wand", 0.01, 0.22, (x-0.24, gy, z+0.1), M['chrome'], rot=(math.radians(20),0,0))
    # branding strip (warm lit)
    box("EspBadge", (0.02, 0.3, 0.05), (x-0.255, y, z+0.42), M['led_soft'])

def build_grinder(loc):
    x, y, z = loc
    box("GrBase", (0.18, 0.2, 0.12), (x, y, z+0.06), M['black_satin'])
    body = cyl("GrBody", 0.085, 0.34, (x, y, z+0.28), M['black_satin'])
    # clear hopper with beans
    hop = cyl("GrHopper", 0.07, 0.2, (x, y, z+0.55), M['glass']); shade_smooth(hop)
    cyl("GrBeans", 0.062, 0.13, (x, y, z+0.52), M['beans'])
    cyl("GrChute", 0.03, 0.08, (x-0.09, y, z+0.2), M['black_matte'], rot=(0,math.radians(90),0))

def build_tap(loc):
    x, y, z = loc
    # gooseneck: vertical + arc (approx with a couple cylinders)
    cyl("TapStem", 0.018, 0.22, (x, y, z+0.11), M['brass'])
    cyl("TapArm", 0.016, 0.16, (x-0.06, y, z+0.22), M['brass'], rot=(0, math.radians(60), 0))
    cyl("TapSpout", 0.012, 0.08, (x-0.12, y, z+0.18), M['brass'], rot=(math.radians(20),0,0))
    # small recessed sink (dark)
    box("Sink", (0.26, 0.34, 0.02), (x-0.02, y, z+0.005), M['steel'])

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

def build_plant(loc):
    x, y, z = loc
    cyl("Pot", 0.2, 0.5, (x, y, z+0.25), M['black_matte'])
    cyl("PotRim", 0.21, 0.06, (x, y, z+0.49), M['black_satin'])
    # foliage as a cluster of low-poly ico blobs (reads as a leafy shrub)
    random.seed(3)
    for i in range(7):
        bx = x + random.uniform(-0.18, 0.18)
        by = y + random.uniform(-0.18, 0.18)
        bz = z + 0.7 + random.uniform(0.0, 0.55)
        r = random.uniform(0.18, 0.3)
        bpy.ops.mesh.primitive_ico_sphere_add(radius=r, subdivisions=2, location=(bx, by, bz))
        o = bpy.context.active_object
        o.name = f"Foliage{i}"
        o.scale = (1.0, 1.0, random.uniform(1.2, 1.7))
        # roughen the blob a touch
        for v in o.data.vertices:
            v.co += Vector((random.uniform(-0.03,0.03), random.uniform(-0.03,0.03), random.uniform(-0.03,0.03)))
        o.data.materials.append(M['leaf'])
        shade_smooth(o)
    # a couple of tall stems
    for i in range(3):
        cyl(f"Stem{i}", 0.012, 1.0, (x+random.uniform(-0.1,0.1), y+random.uniform(-0.1,0.1), z+0.7),
            M['oak_dark'], rot=(random.uniform(-0.2,0.2), random.uniform(-0.2,0.2), 0))

# ----------------------------------------------------------------------------- speaker wall (far)
def build_speaker_wall():
    cx = ROOM_W/2; y = ROOM_L-0.12
    # central black recessed baffle
    box("SpkBaffle", (1.1, 0.12, 2.0), (cx, y, 1.2), M['black_matte'])
    box("SpkInset", (0.9, 0.06, 1.8), (cx, y-0.04, 1.2), M['felt_green'])
    # stacked drivers (4 woofers + tweeter)
    for i, zz in enumerate([0.7, 1.15, 1.6, 2.0]):
        r = 0.22 if zz < 1.9 else 0.12
        cyl(f"Drv{i}", r, 0.08, (cx, y-0.06, zz), M['black_satin'], rot=(math.radians(90),0,0))
        cyl(f"DrvCone{i}", r*0.7, 0.04, (cx, y-0.09, zz), M['speaker_cone'], rot=(math.radians(90),0,0))
        cyl(f"DrvCap{i}", r*0.25, 0.05, (cx, y-0.12, zz), M['black_matte'], rot=(math.radians(90),0,0))
    # flanking oak-slat columns
    for sx in [cx-0.85, cx+0.85]:
        for j in range(8):
            box(f"SpkSlat{sx}{j}", (0.05, 0.05, 1.9), (sx + (j-4)*0.06, y, 1.2), M['oak'])
    # warm niche shelves on either side with bottles
    for sx in [cx-1.3, cx+1.3]:
        for k, zz in enumerate([0.9, 1.5, 2.1]):
            box(f"Niche{sx}{k}", (0.5, 0.28, 0.03), (sx, y-0.1, zz), M['oak'])
            box(f"NicheLED{sx}{k}", (0.46, 0.02, 0.02), (sx, y-0.22, zz+0.13), M['led_soft'])
            cyl(f"Bot{sx}{k}", 0.04, 0.26, (sx-0.1, y-0.1, zz+0.15), M['glass'])

# ----------------------------------------------------------------------------- world + render
def setup_world():
    world = bpy.data.worlds.new("W"); bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = srgb(26, 24, 24)
    bg.inputs["Strength"].default_value = 0.32

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
    sc.view_settings.exposure = 0.55
    sc.view_settings.gamma = 1.0

CAMERAS = {
    # name: (location, look_at, focal_mm)
    'counter_hero': ((1.9, 0.35, 1.5), (2.75, 7.0, 1.05), 26),
    'entrance':     ((2.0, 0.7, 1.55), (2.2, 5.5, 1.2), 24),
    'equipment':    ((2.1, 2.2, 1.35), (3.2, 3.2, 1.1), 42),
    'brew_lab':     ((2.0, 4.6, 1.4), (3.3, 3.6, 1.05), 38),
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
    place_camera()
    setup_render()
    print(f"[nocture] rendering {args.camera} {W}x{H} {args.samples}spp -> {args.out}")
    bpy.ops.render.render(write_still=True)
    print("[nocture] done")

if __name__ == "__main__":
    main()
