//@ts-check

import { AstELM, parse as parseApi } from "./ast.js"
import * as Tsd from "./tsd-generator.js"

export const DOC = `
## API

Les fichier d'api sont des fichiers intermédiaires,
leurs syntaxe particuliére est contrainte par l'organisation des données contenu dans la documentation de DAZ.
Ces fichiers ont été générer à l'aide de api-formatter.js
`

const API_NAMES = [
    "DzAppSettingsMgr",
    "DzFileLoadFilter",
    "DzTextureModifier",
    "DzElementDuplicateContext",
    "DzBakerOptions",
    "DzTextureConvertorOptions",
    "DzDoubleVector",
    "DzWeightMapContext",
    "DzHelpContentsItem",
    "DzDirFilter",
    "DateTime",
    "QString",
    // 3
    "Dz3DViewport",
    "Dz3DViewRenderHandler",
    // A
    "DzAbstractAssetContainer",
    "DzAbstractNodeEditorPane",
    "DzAction",
    "DzActionMenu",
    "DzActionMenuItem",
    "DzActionMgr",
    "DzActivityLayout",
    "DzAddBlend",
    "DzAlembicExporter",
    "DzAlphaBlend",
    "DzApp",
    "DzAppSettings",
    "Array",
    "DzArrayHelper",
    "DzAsset",
    "DzAssetFileOutFilter",
    "DzAssetIOFilter",
    "DzAssetIOMgr",
    "DzAssetMgr",
    "DzAudioClip",
    "DzAudioImporter",
    "DzAuthenticationMgr",
    "DzAuthor",
    // B
    "DzBackdrop",
    "DzBase",
    "DzBasicCamera",
    "DzBasicDialog",
    "DzBone",
    "Boolean",
    "DzBoolProperty",
    "DzBox3",
    "DzBoxLayout",
    "DzBrickMaterial",
    "DzButton",
    "DzButtonGroup",
    "ByteArray",
    // C
    "DzCallBack",
    "DzCallBackMgr",
    "DzCamera",
    "DzCameraAssetFilter",
    "DzCategoryAssetContainer",
    "DzCharacterAssetFilter",
    "DzCheckBox",
    "DzCheckListItem",
    "DzCircle3",
    "Color",
    "DzColorDialog",
    "DzColorProperty",
    "DzColorWgt",
    "DzComboBox",
    "DzComboEdit",
    "DzCompatibilityBaseAssetContainer",
    "DzContentFile",
    "DzContentFolder",
    "DzContentMgr",
    "DzContentReplaceMgr",
    "DzController",
    "DzCr2Exporter",
    "DzCustomData",
    // D
    "Date",
    "DzDateEdit",
    "DzDateTimeEdit",
    "DzDefaultMaterial",
    "DzDelightRenderer",
    "QDesktopWidget",
    "DzDevice",
    "DzDeviceMgr",
    "DzDForm",
    "DzDFormAssetFilter",
    "DzDFormBase",
    "DzDFormZone",
    "DzDial",
    "DzDialog",
    "DzDir",
    "DzDistantLight",
    "DzDockArea",
    "DzDockAreaColumn",
    "DzDockBar",
    "DzDockWindow",
    "DzDomAttr",
    "DzDomBasicNode",
    "DzDomCDATASection",
    "DzDomCharacterData",
    "DzDomComment",
    "DzDomDocument",
    "DzDomDocumentFragment",
    "DzDomDocumentType",
    "DzDomElement",
    "DzDomEntity",
    "DzDomEntityReference",
    "DzDomNode",
    "DzDomNotation",
    "DzDomProcessingInstruction",
    "DzDomText",
    "DzDrawStyle",
    "DzDynamicDividerWgt",
    // E
    "DzEdge",
    "DzElement",
    "DzElementData",
    "DzElementPostLoadFileData",
    "DzEnumProperty",
    "DzEnumSlider",
    "DzERCBake",
    "DzERCFreeze",
    "DzERCLink",
    "Error",
    "DzError",
    "EvalError",
    "DzExporter",
    "DzExportMgr",
    // F
    "DzFacet",
    "DzFbxExporter",
    "DzFbxImporter",
    "DzFigure",
    "DzFile",
    "DzFileDialog",
    "DzFileFilter",
    "DzFileInfo",
    "DzFileIO",
    "DzFileIOPresetMgr",
    "DzFileIOSettings",
    "DzFileProperty",
    "DzFlipManip",
    "DzFloat2Property",
    "DzFloat3Property",
    "DzFloatColor",
    "DzFloatColorProperty",
    "DzFloatProperty",
    "DzFloatSlider",
    "DzFolderAssetContainer",
    "Font",
    "Function",
    // G
    "DzGeometry",
    "DzGeometryImporter",
    "DzGeometryShellNode",
    "DzGeometryUtil",
    "DzGeomSourceFileData",
    "Global",
    "DzGridLayout",
    "DzGroupBox",
    "DzGroupNode",
    "DzGuidePage",
    "DzGZFile",
    // H
    "DzHBoxLayout",
    "DzHButtonGroup",
    "DzHeader",
    "DzHelpMgr",
    "DzHGroupBox",
    "DzHierarchicalMaterialAssetFilter",
    "DzHierarchicalPoseAssetFilter",
    // I
    "Image",
    "DzImageBlend",
    "DzImageColorLayer",
    "DzImageComponent",
    "DzImageFileLayer",
    "DzImageLayer",
    "DzImageManip",
    "DzImageMask",
    "DzImageMgr",
    "DzImageProperty",
    "DzImageRenderHandler",
    "DzImageTexture",
    "DzImporter",
    "DzImportMgr",
    "DzInfoDivider",
    "DzInfoTabs",
    "DzInstanceGroupItem",
    "DzInstanceGroupNode",
    "DzInstanceNode",
    "DzInt2",
    "DzInt2Property",
    "DzInteractiveInstructionObject",
    "DzInteractiveLessonMgr",
    "DzInteractiveLessonObject",
    "DzIntProperty",
    "DzIntSlider",
    "DzInvertManip",
    "DzIrayRenderer",
    // J
    "JSON",
    // L
    "DzLabel",
    "DzLayerAssetFilter",
    "DzLayeredImage",
    "DzLayeredTexture",
    "DzLayout",
    "DzLCDNumber",
    "DzLight",
    "DzLightAssetFilter",
    "DzLine3",
    "DzLinearPointLight",
    "DzLineEdit",
    "DzListBox",
    "DzListView",
    "DzListViewItem",
    // M
    "DzMainWindow",
    "DzMaterial",
    "DzMaterialAssetFilter",
    "Math",
    "DzMatrix3",
    "DzMatrix4",
    "DzMenu",
    "DzMessageBox",
    "DzModifier",
    "DzMorph",
    "DzMorphLoader",
    "DzMorphLoaderBatch",
    "DzMorphSupportAssetFilter",
    "DzMultiMediaMgr",
    "DzMultiplyBlend",
    // N
    "NativeError",
    "DzNode",
    "DzNodeAligner",
    "DzNodeProperty",
    "DzNodeSelectionComboBox",
    "DzNodeSupportAssetFilter",
    "Number",
    "DzNumericController",
    "DzNumericNodeProperty",
    "DzNumericProperty",
    // O
    "Object",
    "DzObject",
    "QObject",
    "DzObjExporter",
    "DzObjImporter",
    "DzOffsetManip",
    "DzOpacityManip",
    "DzOpenGL",
    "DzOrientedBox3",
    // P
    "Palette",
    "DzPane",
    "DzPaneGroup",
    "DzPaneMgr",
    "DzPaneSettings",
    "DzParentProductContainer",
    "DzPathComboBox",
    "DzPersistentMenu",
    "Pixmap",
    "DzPlugin",
    "DzPluginMgr",
    "Point",
    "DzPointLight",
    "DzPopupMenu",
    "DzPoseAssetFilter",
    "DzPresentation",
    "DzProcess",
    "DzProductAssetContainer",
    "DzProductHolderContainer",
    "DzPropertiesAssetFilter",
    "DzProperty",
    "DzPropertyGroup",
    "DzPropertyGroupTree",
    "DzPropertySelectionComboBox",
    "DzPropertySettings",
    "DzPuppeteerAssetFilter",
    "DzPushButton",
    "DzPZ3Importer",
    // Q
    "DzQuat",
    // R
    "DzRadioButton",
    "RangeError",
    "Rect",
    "DzRefCountedItem",
    "ReferenceError",
    "RegExp",
    "DzRenderer",
    "DzRendererMode",
    "DzRenderHandler",
    "DzRenderMgr",
    "DzRenderOptions",
    "DzRenderSettingsAssetFilter",
    "DzRotateManip",
    "DzRotationOrder",
    "DzRSLShader",
    // S
    "DzSaveFilter",
    "DzSaveFilterMgr",
    "DzScaleManip",
    "DzScene",
    "DzSceneAssetFilter",
    "DzSceneData",
    "DzSceneHelper",
    "DzSceneSubsetAssetFilter",
    "DzSceneSupportAssetFilter",
    "DzScript",
    "DzScriptContext",
    "DzScriptedRenderer",
    "DzScrollArea",
    "DzScrollView",
    "DzSearchContainer",
    "DzSelectionMap",
    "DzSettings",
    "DzSettingsHelper",
    "DzShaderAssetFilter",
    "DzShaderCamera",
    "DzShaderDescription",
    "DzShaderLight",
    "DzShaderMaterial",
    "DzShaderParameter",
    "DzShaderSupportAssetFilter",
    "DzShape",
    "DzShapeRiggingAdjuster",
    "DzShapingAssetFilter",
    "DzSimpleElementData",
    "DzSimpleElementScriptData",
    "DzSimpleSceneData",
    "DzSimpleSceneScriptData",
    "DzSimulationSettingsAssetFilter",
    "Size",
    "DzSkeleton",
    "DzSkeletonProperty",
    "DzSkinBinding",
    "DzSourceFileData",
    "DzSplitter",
    "DzSpotLight",
    "String",
    "DzStringHelper",
    "DzStringProperty",
    "DzStyle",
    "DzSubtractBlend",
    "SyntaxError",
    "DzSystem",
    // T
    "DzTabWidget",
    "DzTextBrowser",
    "DzTextEdit",
    "DzTexture",
    "DzTextureComponent",
    "DzTextureLayer",
    "DzTextureMask",
    "DzTime",
    "DzTimeEdit",
    "DzTimer",
    "DzTimeRange",
    "DzToolBar",
    "DzToolBarItem",
    "DzTopLevelAssetContainer",
    "DzTransferUtility",
    "DzTypeAssetContainer",
    "TypeError",
    // U
    "DzU3DExporter",
    "DzUiLoader",
    "DzUIPopUpWgt",
    "DzUiWidget",
    "DzUndoStack",
    "DzUri",
    "URIError",
    "DzUserDrawStyle",
    "DzUVSet",
    "DzUVSupportAssetFilter",
    // V
    "DzVBoxLayout",
    "DzVButtonGroup",
    "DzVec2",
    "DzVec3",
    "DzVersion",
    "DzVGroupBox",
    "DzVideoClip",
    "DzVideoExporter",
    "DzView",
    "DzViewport",
    "DzViewportMgr",
    "DzViewRenderHandler",
    "DzViewTool",
    // W
    "DzWearablesAssetFilter",
    "DzWeld",
    "DzWidget",
    "QWidget",
    // Z
    "DzZipFile",
]

export class File
{
    /** @type {string} */
    name

    /** @type {string} */
    path

    /**
     * @type {string}
     * @private
     */
    content

    /** @type {string} */
    error

    /**
     * @type {number}
     * @private
     */
    index

    /**
     * @type {AstELM}
     * @private
     */
    ast

    /** @type {Record <string, string>} */
    syms

    /**
     * @type {string}
     * @private
     */
    tsd

    /**
     * @param {string} name 
     * @param {number} index
     * @param {string} path
     * @param {string} content
     */
    constructor (name, index, path, content)
    {
        this.name = name
        this.index = index
        this.path = path
        this.url = getUrl (name)
        this.content = content
        this.ast = null
        this.error = null
    }

    getIndex ()
    {
        return this.index
    }

    getUrl ()
    {
        return "http://docs.daz3d.com/doku.php/public/software/dazstudio/4/referenceguide/scripting/api_reference/object_index/" + 
                ( this.name.startsWith ("Q") && this.name[1].toUpperCase () == this.name[1]
                ? this.name.substring (1).toLowerCase () + "_q"
                : this.name.startsWith ("Dz") && this.name[2].toUpperCase () == this.name[2]
                ? this.name.substring (2).toLowerCase () + "_dz"
                : this.name.toLowerCase ()
                )
    }

    /** @param {string} text */
    setContent (text)
    {
        this.content = text
        this.ast = null
        this.tsd = null
    }

    getContent ()
    {
        return this.content
    }

    getApiCode ()
    {
        return this.content == null || this.content.length < 4 || this.content[3] != " "
             ? null : this.content.substring (0, 3)
    }

    getAst ()
    {
        if (this.ast != null)
            return this.ast

        if (this.content == null)
            return null

        const r = parseApi (this.content)
        if (r.error) {
            this.ast = null
            this.tsd = null
            this.error = r.mssage
        }
        else {
            this.ast = r.value
            this.tsd = null
            this.error = null
        }
        return this.ast
    }

    getSymbols ()
    {
        if (this.syms != null)
            return this.syms

        if (this.ast == null)
            this.ast = this.getAst ()

        if (this.ast == null)
            return null
        
        this.syms = {}
        for (var e of this.ast.enumerations) this.syms[e.name] = e.$
        for (var p of this.ast.properties)   this.syms[p.name] = p.$
        for (var c of this.ast.constructors) this.syms[c.name] = c.$
        for (var f of this.ast.functions)    this.syms[f.name] = f.$
        for (var s of this.ast.statics)      this.syms[s.name] = s.$
        return this.syms
    }

    getTsd ()
    {
        if (this.tsd != null)
            return this.tsd

        const ast = this.getAst ()
        if (ast == null)
            return null

        this.tsd = Tsd.generate (ast)
        return this.tsd
    }

    save ()
    {
        try {
            const fs = require ("fs")
            fs.writeFileSync (this.path, this.content, { encoding: "utf8" })
        }
        catch {
            var blob = new Blob([this.content], { type: "text/text" });
            window.saveAs (blob, this.name + ".api");
        }
    }
}

export async function init ()
{
    setFiles (await Promise.all (    
        API_NAMES.map ((n, i) =>
        {
            const path = `./api/${n}.api`
            try
            {
                return fetch (path)
                        .then (async res => res.ok
                            ? new File (n, i, path, await res.text ())
                            : new File (n, i, path, null)
                        )
                        .catch (() =>  new File (n, i, path, null))
            }
            catch (error)
            {
                return new File (n, i, path, null)
            }
        }))
    )
}

/**
 * @param {String} name
 */
export function get (name)
{
    if (_files == null)
        return null

    for (var f of _files) {
        if (f.name == name) return f
    }
    return null
}

/**
 * @param {String} name
 */
export function getUrl (name)
{
    return "http://docs.daz3d.com/doku.php/public/software/dazstudio/4/referenceguide/scripting/api_reference/object_index/" + 
            ( name.startsWith ("Q") && name[1].toUpperCase () == name[1]
            ? name.substring (1).toLowerCase () + "_q"
            : name.startsWith ("Dz") && name[2].toUpperCase () == name[2]
            ? name.substring (2).toLowerCase () + "_dz"
            : name.toLowerCase ()
            )
}

// State

/** @typedef {"change:apiList"|"change:message"} ApiStateEvents */

/** @type {File[]} */
var _files

/**
 * 
 * @param {ApiStateEvents} event 
 * @param {(e: ApiStateEvents) => void} func 
 */
export function on (event, func)
{
    //@ts-ignore
    document.addEventListener (event, e => func (event))
}

export function getFiles ()
{
    return _files
}

/**
 * @param {File[]} files
 */
export function setFiles (files)
{
    _files = files
    document.dispatchEvent (new CustomEvent ("change:apiList"))
}
