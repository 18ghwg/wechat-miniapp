/**
 * 地区数据（独立文件）
 * �config/index.js 迁移而来
 * 仅在需要时加载（如电费查询页面、地址选择等）
 * 
 * 使用方式：
 * import { areaData } from '../../config/area-data';
 */

export const areaData = [
  {
    label: '北京市',
    value: '110000',
    children: [
      {
        label: '北京市',
        value: '110100',
        children: [
          {
            label: '东城区',
            value: '110101',
            children: null,
          },
          {
            label: '西城区',
            value: '110102',
            children: null,
          },
          {
            label: '朝阳区',
            value: '110105',
            children: null,
          },
          {
            label: '丰台区',
            value: '110106',
            children: null,
          },
          {
            label: '石景山区',
            value: '110107',
            children: null,
          },
          {
            label: '海淀区',
            value: '110108',
            children: null,
          },
          {
            label: '门头沟区',
            value: '110109',
            children: null,
          },
          {
            label: '房山区',
            value: '110111',
            children: null,
          },
          {
            label: '通州区',
            value: '110112',
            children: null,
          },
          {
            label: '顺义区',
            value: '110113',
            children: null,
          },
          {
            label: '昌平区',
            value: '110114',
            children: null,
          },
          {
            label: '大兴区',
            value: '110115',
            children: null,
          },
          {
            label: '怀柔区',
            value: '110116',
            children: null,
          },
          {
            label: '平谷区',
            value: '110117',
            children: null,
          },
          {
            label: '密云区',
            value: '110118',
            children: null,
          },
          {
            label: '延庆区',
            value: '110119',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '天津市',
    value: '120000',
    children: [
      {
        label: '天津市',
        value: '120100',
        children: [
          {
            label: '和平区',
            value: '120101',
            children: null,
          },
          {
            label: '河东区',
            value: '120102',
            children: null,
          },
          {
            label: '河西区',
            value: '120103',
            children: null,
          },
          {
            label: '南开区',
            value: '120104',
            children: null,
          },
          {
            label: '河北区',
            value: '120105',
            children: null,
          },
          {
            label: '红桥区',
            value: '120106',
            children: null,
          },
          {
            label: '东丽区',
            value: '120110',
            children: null,
          },
          {
            label: '西青区',
            value: '120111',
            children: null,
          },
          {
            label: '津南区',
            value: '120112',
            children: null,
          },
          {
            label: '北辰区',
            value: '120113',
            children: null,
          },
          {
            label: '武清区',
            value: '120114',
            children: null,
          },
          {
            label: '宝坻区',
            value: '120115',
            children: null,
          },
          {
            label: '滨海新区',
            value: '120116',
            children: null,
          },
          {
            label: '宁河区',
            value: '120117',
            children: null,
          },
          {
            label: '静海区',
            value: '120118',
            children: null,
          },
          {
            label: '蓟州区',
            value: '120119',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '河北省',
    value: '130000',
    children: [
      {
        label: '石家庄市',
        value: '130100',
        children: [
          {
            label: '长安区',
            value: '130102',
            children: null,
          },
          {
            label: '桥西区',
            value: '130104',
            children: null,
          },
          {
            label: '新华区',
            value: '130105',
            children: null,
          },
          {
            label: '井陉矿区',
            value: '130107',
            children: null,
          },
          {
            label: '裕华区',
            value: '130108',
            children: null,
          },
          {
            label: '藁城区',
            value: '130109',
            children: null,
          },
          {
            label: '鹿泉区',
            value: '130110',
            children: null,
          },
          {
            label: '栾城区',
            value: '130111',
            children: null,
          },
          {
            label: '井陉县',
            value: '130121',
            children: null,
          },
          {
            label: '正定县',
            value: '130123',
            children: null,
          },
          {
            label: '行唐县',
            value: '130125',
            children: null,
          },
          {
            label: '灵寿县',
            value: '130126',
            children: null,
          },
          {
            label: '高邑县',
            value: '130127',
            children: null,
          },
          {
            label: '深泽县',
            value: '130128',
            children: null,
          },
          {
            label: '赞皇县',
            value: '130129',
            children: null,
          },
          {
            label: '无极县',
            value: '130130',
            children: null,
          },
          {
            label: '平山县',
            value: '130131',
            children: null,
          },
          {
            label: '元氏县',
            value: '130132',
            children: null,
          },
          {
            label: '赵县',
            value: '130133',
            children: null,
          },
          {
            label: '辛集市',
            value: '130181',
            children: null,
          },
          {
            label: '晋州市',
            value: '130183',
            children: null,
          },
          {
            label: '新乐市',
            value: '130184',
            children: null,
          },
        ],
      },
      {
        label: '唐山市',
        value: '130200',
        children: [
          {
            label: '路南区',
            value: '130202',
            children: null,
          },
          {
            label: '路北区',
            value: '130203',
            children: null,
          },
          {
            label: '古冶区',
            value: '130204',
            children: null,
          },
          {
            label: '开平区',
            value: '130205',
            children: null,
          },
          {
            label: '丰南区',
            value: '130207',
            children: null,
          },
          {
            label: '丰润区',
            value: '130208',
            children: null,
          },
          {
            label: '曹妃甸区',
            value: '130209',
            children: null,
          },
          {
            label: '滦南县',
            value: '130224',
            children: null,
          },
          {
            label: '乐亭县',
            value: '130225',
            children: null,
          },
          {
            label: '迁西县',
            value: '130227',
            children: null,
          },
          {
            label: '玉田县',
            value: '130229',
            children: null,
          },
          {
            label: '芦台区',
            value: '130230',
            children: null,
          },
          {
            label: '遵化市',
            value: '130281',
            children: null,
          },
          {
            label: '迁安市',
            value: '130283',
            children: null,
          },
          {
            label: '滦州市',
            value: '130284',
            children: null,
          },
        ],
      },
      {
        label: '秦皇岛市',
        value: '130300',
        children: [
          {
            label: '海港区',
            value: '130302',
            children: null,
          },
          {
            label: '山海关区',
            value: '130303',
            children: null,
          },
          {
            label: '北戴河区',
            value: '130304',
            children: null,
          },
          {
            label: '抚宁区',
            value: '130306',
            children: null,
          },
          {
            label: '青龙满族自治县',
            value: '130321',
            children: null,
          },
          {
            label: '昌黎县',
            value: '130322',
            children: null,
          },
          {
            label: '卢龙县',
            value: '130324',
            children: null,
          },
        ],
      },
      {
        label: '邯郸市',
        value: '130400',
        children: [
          {
            label: '邯山区',
            value: '130402',
            children: null,
          },
          {
            label: '丛台区',
            value: '130403',
            children: null,
          },
          {
            label: '复兴区',
            value: '130404',
            children: null,
          },
          {
            label: '峰峰矿区',
            value: '130406',
            children: null,
          },
          {
            label: '肥乡区',
            value: '130407',
            children: null,
          },
          {
            label: '永年区',
            value: '130408',
            children: null,
          },
          {
            label: '临漳县',
            value: '130423',
            children: null,
          },
          {
            label: '成安县',
            value: '130424',
            children: null,
          },
          {
            label: '大名县',
            value: '130425',
            children: null,
          },
          {
            label: '涉县',
            value: '130426',
            children: null,
          },
          {
            label: '磁县',
            value: '130427',
            children: null,
          },
          {
            label: '邱县',
            value: '130430',
            children: null,
          },
          {
            label: '鸡泽县',
            value: '130431',
            children: null,
          },
          {
            label: '广平县',
            value: '130432',
            children: null,
          },
          {
            label: '馆陶县',
            value: '130433',
            children: null,
          },
          {
            label: '魏县',
            value: '130434',
            children: null,
          },
          {
            label: '曲周县',
            value: '130435',
            children: null,
          },
          {
            label: '武安市',
            value: '130481',
            children: null,
          },
        ],
      },
      {
        label: '邢台市',
        value: '130500',
        children: [
          {
            label: '桥东区',
            value: '130502',
            children: null,
          },
          {
            label: '桥西区',
            value: '130503',
            children: null,
          },
          {
            label: '邢台县',
            value: '130521',
            children: null,
          },
          {
            label: '临城县',
            value: '130522',
            children: null,
          },
          {
            label: '内丘县',
            value: '130523',
            children: null,
          },
          {
            label: '柏乡县',
            value: '130524',
            children: null,
          },
          {
            label: '隆尧县',
            value: '130525',
            children: null,
          },
          {
            label: '任县',
            value: '130526',
            children: null,
          },
          {
            label: '南和县',
            value: '130527',
            children: null,
          },
          {
            label: '宁晋县',
            value: '130528',
            children: null,
          },
          {
            label: '巨鹿县',
            value: '130529',
            children: null,
          },
          {
            label: '新河县',
            value: '130530',
            children: null,
          },
          {
            label: '广宗县',
            value: '130531',
            children: null,
          },
          {
            label: '平乡县',
            value: '130532',
            children: null,
          },
          {
            label: '威县',
            value: '130533',
            children: null,
          },
          {
            label: '清河县',
            value: '130534',
            children: null,
          },
          {
            label: '临西县',
            value: '130535',
            children: null,
          },
          {
            label: '南宫市',
            value: '130581',
            children: null,
          },
          {
            label: '沙河市',
            value: '130582',
            children: null,
          },
        ],
      },
      {
        label: '保定市',
        value: '130600',
        children: [
          {
            label: '竞秀区',
            value: '130602',
            children: null,
          },
          {
            label: '莲池区',
            value: '130606',
            children: null,
          },
          {
            label: '满城区',
            value: '130607',
            children: null,
          },
          {
            label: '清苑区',
            value: '130608',
            children: null,
          },
          {
            label: '徐水区',
            value: '130609',
            children: null,
          },
          {
            label: '涞水县',
            value: '130623',
            children: null,
          },
          {
            label: '阜平县',
            value: '130624',
            children: null,
          },
          {
            label: '定兴县',
            value: '130626',
            children: null,
          },
          {
            label: '唐县',
            value: '130627',
            children: null,
          },
          {
            label: '高阳县',
            value: '130628',
            children: null,
          },
          {
            label: '容城县',
            value: '130629',
            children: null,
          },
          {
            label: '涞源县',
            value: '130630',
            children: null,
          },
          {
            label: '望都县',
            value: '130631',
            children: null,
          },
          {
            label: '安新县',
            value: '130632',
            children: null,
          },
          {
            label: '易县',
            value: '130633',
            children: null,
          },
          {
            label: '曲阳县',
            value: '130634',
            children: null,
          },
          {
            label: '蠡县',
            value: '130635',
            children: null,
          },
          {
            label: '顺平县',
            value: '130636',
            children: null,
          },
          {
            label: '博野县',
            value: '130637',
            children: null,
          },
          {
            label: '雄县',
            value: '130638',
            children: null,
          },
          {
            label: '涿州市',
            value: '130681',
            children: null,
          },
          {
            label: '定州市',
            value: '130682',
            children: null,
          },
          {
            label: '安国市',
            value: '130683',
            children: null,
          },
          {
            label: '高碑店市',
            value: '130684',
            children: null,
          },
        ],
      },
      {
        label: '张家口市',
        value: '130700',
        children: [
          {
            label: '桥东区',
            value: '130702',
            children: null,
          },
          {
            label: '桥西区',
            value: '130703',
            children: null,
          },
          {
            label: '宣化区',
            value: '130705',
            children: null,
          },
          {
            label: '下花园区',
            value: '130706',
            children: null,
          },
          {
            label: '万全区',
            value: '130708',
            children: null,
          },
          {
            label: '崇礼区',
            value: '130709',
            children: null,
          },
          {
            label: '张北县',
            value: '130722',
            children: null,
          },
          {
            label: '康保县',
            value: '130723',
            children: null,
          },
          {
            label: '沽源县',
            value: '130724',
            children: null,
          },
          {
            label: '尚义县',
            value: '130725',
            children: null,
          },
          {
            label: '蔚县',
            value: '130726',
            children: null,
          },
          {
            label: '阳原县',
            value: '130727',
            children: null,
          },
          {
            label: '怀安县',
            value: '130728',
            children: null,
          },
          {
            label: '怀来县',
            value: '130730',
            children: null,
          },
          {
            label: '涿鹿县',
            value: '130731',
            children: null,
          },
          {
            label: '赤城县',
            value: '130732',
            children: null,
          },
        ],
      },
      {
        label: '承德市',
        value: '130800',
        children: [
          {
            label: '双桥区',
            value: '130802',
            children: null,
          },
          {
            label: '双滦区',
            value: '130803',
            children: null,
          },
          {
            label: '鹰手营子矿区',
            value: '130804',
            children: null,
          },
          {
            label: '承德县',
            value: '130821',
            children: null,
          },
          {
            label: '兴隆县',
            value: '130822',
            children: null,
          },
          {
            label: '滦平县',
            value: '130824',
            children: null,
          },
          {
            label: '隆化县',
            value: '130825',
            children: null,
          },
          {
            label: '丰宁满族自治县',
            value: '130826',
            children: null,
          },
          {
            label: '宽城满族自治县',
            value: '130827',
            children: null,
          },
          {
            label: '围场满族蒙古族自治县',
            value: '130828',
            children: null,
          },
          {
            label: '平泉市',
            value: '130881',
            children: null,
          },
        ],
      },
      {
        label: '沧州市',
        value: '130900',
        children: [
          {
            label: '新华区',
            value: '130902',
            children: null,
          },
          {
            label: '运河区',
            value: '130903',
            children: null,
          },
          {
            label: '沧县',
            value: '130921',
            children: null,
          },
          {
            label: '青县',
            value: '130922',
            children: null,
          },
          {
            label: '东光县',
            value: '130923',
            children: null,
          },
          {
            label: '海兴县',
            value: '130924',
            children: null,
          },
          {
            label: '盐山县',
            value: '130925',
            children: null,
          },
          {
            label: '肃宁县',
            value: '130926',
            children: null,
          },
          {
            label: '南皮县',
            value: '130927',
            children: null,
          },
          {
            label: '吴桥县',
            value: '130928',
            children: null,
          },
          {
            label: '献县',
            value: '130929',
            children: null,
          },
          {
            label: '孟村回族自治县',
            value: '130930',
            children: null,
          },
          {
            label: '泊头市',
            value: '130981',
            children: null,
          },
          {
            label: '任丘市',
            value: '130982',
            children: null,
          },
          {
            label: '黄骅市',
            value: '130983',
            children: null,
          },
          {
            label: '河间市',
            value: '130984',
            children: null,
          },
        ],
      },
      {
        label: '廊坊市',
        value: '131000',
        children: [
          {
            label: '安次区',
            value: '131002',
            children: null,
          },
          {
            label: '广阳区',
            value: '131003',
            children: null,
          },
          {
            label: '固安县',
            value: '131022',
            children: null,
          },
          {
            label: '永清县',
            value: '131023',
            children: null,
          },
          {
            label: '香河县',
            value: '131024',
            children: null,
          },
          {
            label: '大城县',
            value: '131025',
            children: null,
          },
          {
            label: '文安县',
            value: '131026',
            children: null,
          },
          {
            label: '大厂回族自治县',
            value: '131028',
            children: null,
          },
          {
            label: '霸州市',
            value: '131081',
            children: null,
          },
          {
            label: '三河市',
            value: '131082',
            children: null,
          },
        ],
      },
      {
        label: '衡水市',
        value: '131100',
        children: [
          {
            label: '桃城区',
            value: '131102',
            children: null,
          },
          {
            label: '冀州区',
            value: '131103',
            children: null,
          },
          {
            label: '枣强县',
            value: '131121',
            children: null,
          },
          {
            label: '武邑县',
            value: '131122',
            children: null,
          },
          {
            label: '武强县',
            value: '131123',
            children: null,
          },
          {
            label: '饶阳县',
            value: '131124',
            children: null,
          },
          {
            label: '安平县',
            value: '131125',
            children: null,
          },
          {
            label: '故城县',
            value: '131126',
            children: null,
          },
          {
            label: '景县',
            value: '131127',
            children: null,
          },
          {
            label: '阜城县',
            value: '131128',
            children: null,
          },
          {
            label: '深州市',
            value: '131182',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '山西省',
    value: '140000',
    children: [
      {
        label: '太原市',
        value: '140100',
        children: [
          {
            label: '小店区',
            value: '140105',
            children: null,
          },
          {
            label: '迎泽区',
            value: '140106',
            children: null,
          },
          {
            label: '杏花岭区',
            value: '140107',
            children: null,
          },
          {
            label: '尖草坪区',
            value: '140108',
            children: null,
          },
          {
            label: '万柏林区',
            value: '140109',
            children: null,
          },
          {
            label: '晋源区',
            value: '140110',
            children: null,
          },
          {
            label: '清徐县',
            value: '140121',
            children: null,
          },
          {
            label: '阳曲县',
            value: '140122',
            children: null,
          },
          {
            label: '娄烦县',
            value: '140123',
            children: null,
          },
          {
            label: '古交市',
            value: '140181',
            children: null,
          },
        ],
      },
      {
        label: '大同市',
        value: '140200',
        children: [
          {
            label: '新荣区',
            value: '140212',
            children: null,
          },
          {
            label: '平城区',
            value: '140213',
            children: null,
          },
          {
            label: '云冈区',
            value: '140214',
            children: null,
          },
          {
            label: '云州区',
            value: '140215',
            children: null,
          },
          {
            label: '阳高县',
            value: '140221',
            children: null,
          },
          {
            label: '天镇县',
            value: '140222',
            children: null,
          },
          {
            label: '广灵县',
            value: '140223',
            children: null,
          },
          {
            label: '灵丘县',
            value: '140224',
            children: null,
          },
          {
            label: '浑源县',
            value: '140225',
            children: null,
          },
          {
            label: '左云县',
            value: '140226',
            children: null,
          },
        ],
      },
      {
        label: '阳泉市',
        value: '140300',
        children: [
          {
            label: '城区',
            value: '140302',
            children: null,
          },
          {
            label: '矿区',
            value: '140303',
            children: null,
          },
          {
            label: '郊区',
            value: '140311',
            children: null,
          },
          {
            label: '平定县',
            value: '140321',
            children: null,
          },
          {
            label: '盂县',
            value: '140322',
            children: null,
          },
        ],
      },
      {
        label: '长治市',
        value: '140400',
        children: [
          {
            label: '潞州区',
            value: '140403',
            children: null,
          },
          {
            label: '上党区',
            value: '140404',
            children: null,
          },
          {
            label: '屯留区',
            value: '140405',
            children: null,
          },
          {
            label: '潞城区',
            value: '140406',
            children: null,
          },
          {
            label: '襄垣县',
            value: '140423',
            children: null,
          },
          {
            label: '平顺县',
            value: '140425',
            children: null,
          },
          {
            label: '黎城县',
            value: '140426',
            children: null,
          },
          {
            label: '壶关县',
            value: '140427',
            children: null,
          },
          {
            label: '长子县',
            value: '140428',
            children: null,
          },
          {
            label: '武乡县',
            value: '140429',
            children: null,
          },
          {
            label: '沁县',
            value: '140430',
            children: null,
          },
          {
            label: '沁源县',
            value: '140431',
            children: null,
          },
        ],
      },
      {
        label: '晋城市',
        value: '140500',
        children: [
          {
            label: '城区',
            value: '140502',
            children: null,
          },
          {
            label: '沁水县',
            value: '140521',
            children: null,
          },
          {
            label: '阳城县',
            value: '140522',
            children: null,
          },
          {
            label: '陵川县',
            value: '140524',
            children: null,
          },
          {
            label: '泽州县',
            value: '140525',
            children: null,
          },
          {
            label: '高平市',
            value: '140581',
            children: null,
          },
        ],
      },
      {
        label: '朔州市',
        value: '140600',
        children: [
          {
            label: '朔城区',
            value: '140602',
            children: null,
          },
          {
            label: '平鲁区',
            value: '140603',
            children: null,
          },
          {
            label: '山阴县',
            value: '140621',
            children: null,
          },
          {
            label: '应县',
            value: '140622',
            children: null,
          },
          {
            label: '右玉县',
            value: '140623',
            children: null,
          },
          {
            label: '怀仁市',
            value: '140681',
            children: null,
          },
        ],
      },
      {
        label: '晋中市',
        value: '140700',
        children: [
          {
            label: '榆次区',
            value: '140702',
            children: null,
          },
          {
            label: '榆社县',
            value: '140721',
            children: null,
          },
          {
            label: '左权县',
            value: '140722',
            children: null,
          },
          {
            label: '和顺县',
            value: '140723',
            children: null,
          },
          {
            label: '昔阳县',
            value: '140724',
            children: null,
          },
          {
            label: '寿阳县',
            value: '140725',
            children: null,
          },
          {
            label: '太谷县',
            value: '140726',
            children: null,
          },
          {
            label: '祁县',
            value: '140727',
            children: null,
          },
          {
            label: '平遥县',
            value: '140728',
            children: null,
          },
          {
            label: '灵石县',
            value: '140729',
            children: null,
          },
          {
            label: '介休市',
            value: '140781',
            children: null,
          },
        ],
      },
      {
        label: '运城市',
        value: '140800',
        children: [
          {
            label: '盐湖区',
            value: '140802',
            children: null,
          },
          {
            label: '临猗县',
            value: '140821',
            children: null,
          },
          {
            label: '万荣县',
            value: '140822',
            children: null,
          },
          {
            label: '闻喜县',
            value: '140823',
            children: null,
          },
          {
            label: '稷山县',
            value: '140824',
            children: null,
          },
          {
            label: '新绛县',
            value: '140825',
            children: null,
          },
          {
            label: '绛县',
            value: '140826',
            children: null,
          },
          {
            label: '垣曲县',
            value: '140827',
            children: null,
          },
          {
            label: '夏县',
            value: '140828',
            children: null,
          },
          {
            label: '平陆县',
            value: '140829',
            children: null,
          },
          {
            label: '芮城县',
            value: '140830',
            children: null,
          },
          {
            label: '永济市',
            value: '140881',
            children: null,
          },
          {
            label: '河津市',
            value: '140882',
            children: null,
          },
        ],
      },
      {
        label: '忻州市',
        value: '140900',
        children: [
          {
            label: '忻府区',
            value: '140902',
            children: null,
          },
          {
            label: '定襄县',
            value: '140921',
            children: null,
          },
          {
            label: '五台县',
            value: '140922',
            children: null,
          },
          {
            label: '代县',
            value: '140923',
            children: null,
          },
          {
            label: '繁峙县',
            value: '140924',
            children: null,
          },
          {
            label: '宁武县',
            value: '140925',
            children: null,
          },
          {
            label: '静乐县',
            value: '140926',
            children: null,
          },
          {
            label: '神池县',
            value: '140927',
            children: null,
          },
          {
            label: '五寨县',
            value: '140928',
            children: null,
          },
          {
            label: '岢岚县',
            value: '140929',
            children: null,
          },
          {
            label: '河曲县',
            value: '140930',
            children: null,
          },
          {
            label: '保德县',
            value: '140931',
            children: null,
          },
          {
            label: '偏关县',
            value: '140932',
            children: null,
          },
          {
            label: '原平市',
            value: '140981',
            children: null,
          },
        ],
      },
      {
        label: '临汾市',
        value: '141000',
        children: [
          {
            label: '尧都区',
            value: '141002',
            children: null,
          },
          {
            label: '曲沃县',
            value: '141021',
            children: null,
          },
          {
            label: '翼城县',
            value: '141022',
            children: null,
          },
          {
            label: '襄汾县',
            value: '141023',
            children: null,
          },
          {
            label: '洪洞县',
            value: '141024',
            children: null,
          },
          {
            label: '古县',
            value: '141025',
            children: null,
          },
          {
            label: '安泽县',
            value: '141026',
            children: null,
          },
          {
            label: '浮山县',
            value: '141027',
            children: null,
          },
          {
            label: '吉县',
            value: '141028',
            children: null,
          },
          {
            label: '乡宁县',
            value: '141029',
            children: null,
          },
          {
            label: '大宁县',
            value: '141030',
            children: null,
          },
          {
            label: '隰县',
            value: '141031',
            children: null,
          },
          {
            label: '永和县',
            value: '141032',
            children: null,
          },
          {
            label: '蒲县',
            value: '141033',
            children: null,
          },
          {
            label: '汾西县',
            value: '141034',
            children: null,
          },
          {
            label: '侯马市',
            value: '141081',
            children: null,
          },
          {
            label: '霍州市',
            value: '141082',
            children: null,
          },
        ],
      },
      {
        label: '吕梁市',
        value: '141100',
        children: [
          {
            label: '离石区',
            value: '141102',
            children: null,
          },
          {
            label: '文水县',
            value: '141121',
            children: null,
          },
          {
            label: '交城县',
            value: '141122',
            children: null,
          },
          {
            label: '兴县',
            value: '141123',
            children: null,
          },
          {
            label: '临县',
            value: '141124',
            children: null,
          },
          {
            label: '柳林县',
            value: '141125',
            children: null,
          },
          {
            label: '石楼县',
            value: '141126',
            children: null,
          },
          {
            label: '岚县',
            value: '141127',
            children: null,
          },
          {
            label: '方山县',
            value: '141128',
            children: null,
          },
          {
            label: '中阳县',
            value: '141129',
            children: null,
          },
          {
            label: '交口县',
            value: '141130',
            children: null,
          },
          {
            label: '孝义市',
            value: '141181',
            children: null,
          },
          {
            label: '汾阳市',
            value: '141182',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '内蒙古自治区',
    value: '150000',
    children: [
      {
        label: '呼和浩特市',
        value: '150100',
        children: [
          {
            label: '新城区',
            value: '150102',
            children: null,
          },
          {
            label: '回民区',
            value: '150103',
            children: null,
          },
          {
            label: '玉泉区',
            value: '150104',
            children: null,
          },
          {
            label: '赛罕区',
            value: '150105',
            children: null,
          },
          {
            label: '土默特左旗',
            value: '150121',
            children: null,
          },
          {
            label: '托克托县',
            value: '150122',
            children: null,
          },
          {
            label: '和林格尔县',
            value: '150123',
            children: null,
          },
          {
            label: '清水河县',
            value: '150124',
            children: null,
          },
          {
            label: '武川县',
            value: '150125',
            children: null,
          },
        ],
      },
      {
        label: '包头市',
        value: '150200',
        children: [
          {
            label: '东河区',
            value: '150202',
            children: null,
          },
          {
            label: '昆都仑区',
            value: '150203',
            children: null,
          },
          {
            label: '青山区',
            value: '150204',
            children: null,
          },
          {
            label: '石拐区',
            value: '150205',
            children: null,
          },
          {
            label: '白云鄂博矿区',
            value: '150206',
            children: null,
          },
          {
            label: '九原区',
            value: '150207',
            children: null,
          },
          {
            label: '土默特右旗',
            value: '150221',
            children: null,
          },
          {
            label: '固阳县',
            value: '150222',
            children: null,
          },
          {
            label: '达尔罕茂明安联合旗',
            value: '150223',
            children: null,
          },
        ],
      },
      {
        label: '乌海市',
        value: '150300',
        children: [
          {
            label: '海勃湾区',
            value: '150302',
            children: null,
          },
          {
            label: '海南区',
            value: '150303',
            children: null,
          },
          {
            label: '乌达区',
            value: '150304',
            children: null,
          },
        ],
      },
      {
        label: '赤峰市',
        value: '150400',
        children: [
          {
            label: '红山区',
            value: '150402',
            children: null,
          },
          {
            label: '元宝山区',
            value: '150403',
            children: null,
          },
          {
            label: '松山区',
            value: '150404',
            children: null,
          },
          {
            label: '阿鲁科尔沁旗',
            value: '150421',
            children: null,
          },
          {
            label: '巴林左旗',
            value: '150422',
            children: null,
          },
          {
            label: '巴林右旗',
            value: '150423',
            children: null,
          },
          {
            label: '林西县',
            value: '150424',
            children: null,
          },
          {
            label: '克什克腾旗',
            value: '150425',
            children: null,
          },
          {
            label: '翁牛特旗',
            value: '150426',
            children: null,
          },
          {
            label: '喀喇沁旗',
            value: '150428',
            children: null,
          },
          {
            label: '宁城县',
            value: '150429',
            children: null,
          },
          {
            label: '敖汉旗',
            value: '150430',
            children: null,
          },
        ],
      },
      {
        label: '通辽市',
        value: '150500',
        children: [
          {
            label: '科尔沁区',
            value: '150502',
            children: null,
          },
          {
            label: '科尔沁左翼中旗',
            value: '150521',
            children: null,
          },
          {
            label: '科尔沁左翼后旗',
            value: '150522',
            children: null,
          },
          {
            label: '开鲁县',
            value: '150523',
            children: null,
          },
          {
            label: '库伦旗',
            value: '150524',
            children: null,
          },
          {
            label: '奈曼旗',
            value: '150525',
            children: null,
          },
          {
            label: '扎鲁特旗',
            value: '150526',
            children: null,
          },
          {
            label: '霍林郭勒市',
            value: '150581',
            children: null,
          },
        ],
      },
      {
        label: '鄂尔多斯市',
        value: '150600',
        children: [
          {
            label: '东胜区',
            value: '150602',
            children: null,
          },
          {
            label: '康巴什区',
            value: '150603',
            children: null,
          },
          {
            label: '达拉特旗',
            value: '150621',
            children: null,
          },
          {
            label: '准格尔旗',
            value: '150622',
            children: null,
          },
          {
            label: '鄂托克前旗',
            value: '150623',
            children: null,
          },
          {
            label: '鄂托克旗',
            value: '150624',
            children: null,
          },
          {
            label: '杭锦旗',
            value: '150625',
            children: null,
          },
          {
            label: '乌审旗',
            value: '150626',
            children: null,
          },
          {
            label: '伊金霍洛旗',
            value: '150627',
            children: null,
          },
        ],
      },
      {
        label: '呼伦贝尔市',
        value: '150700',
        children: [
          {
            label: '海拉尔区',
            value: '150702',
            children: null,
          },
          {
            label: '扎赉诺尔区',
            value: '150703',
            children: null,
          },
          {
            label: '阿荣旗',
            value: '150721',
            children: null,
          },
          {
            label: '莫力达瓦达斡尔族自治旗',
            value: '150722',
            children: null,
          },
          {
            label: '鄂伦春自治旗',
            value: '150723',
            children: null,
          },
          {
            label: '鄂温克族自治旗',
            value: '150724',
            children: null,
          },
          {
            label: '陈巴尔虎旗',
            value: '150725',
            children: null,
          },
          {
            label: '新巴尔虎左旗',
            value: '150726',
            children: null,
          },
          {
            label: '新巴尔虎右旗',
            value: '150727',
            children: null,
          },
          {
            label: '满洲里市',
            value: '150781',
            children: null,
          },
          {
            label: '牙克石市',
            value: '150782',
            children: null,
          },
          {
            label: '扎兰屯市',
            value: '150783',
            children: null,
          },
          {
            label: '额尔古纳市',
            value: '150784',
            children: null,
          },
          {
            label: '根河市',
            value: '150785',
            children: null,
          },
        ],
      },
      {
        label: '巴彦淖尔市',
        value: '150800',
        children: [
          {
            label: '临河区',
            value: '150802',
            children: null,
          },
          {
            label: '五原县',
            value: '150821',
            children: null,
          },
          {
            label: '磴口县',
            value: '150822',
            children: null,
          },
          {
            label: '乌拉特前旗',
            value: '150823',
            children: null,
          },
          {
            label: '乌拉特中旗',
            value: '150824',
            children: null,
          },
          {
            label: '乌拉特后旗',
            value: '150825',
            children: null,
          },
          {
            label: '杭锦后旗',
            value: '150826',
            children: null,
          },
        ],
      },
      {
        label: '乌兰察布市',
        value: '150900',
        children: [
          {
            label: '集宁区',
            value: '150902',
            children: null,
          },
          {
            label: '卓资县',
            value: '150921',
            children: null,
          },
          {
            label: '化德县',
            value: '150922',
            children: null,
          },
          {
            label: '商都县',
            value: '150923',
            children: null,
          },
          {
            label: '兴和县',
            value: '150924',
            children: null,
          },
          {
            label: '凉城县',
            value: '150925',
            children: null,
          },
          {
            label: '察哈尔右翼前旗',
            value: '150926',
            children: null,
          },
          {
            label: '察哈尔右翼中旗',
            value: '150927',
            children: null,
          },
          {
            label: '察哈尔右翼后旗',
            value: '150928',
            children: null,
          },
          {
            label: '四子王旗',
            value: '150929',
            children: null,
          },
          {
            label: '丰镇市',
            value: '150981',
            children: null,
          },
        ],
      },
      {
        label: '兴安盟',
        value: '152200',
        children: [
          {
            label: '乌兰浩特市',
            value: '152201',
            children: null,
          },
          {
            label: '阿尔山市',
            value: '152202',
            children: null,
          },
          {
            label: '科尔沁右翼前旗',
            value: '152221',
            children: null,
          },
          {
            label: '科尔沁右翼中旗',
            value: '152222',
            children: null,
          },
          {
            label: '扎赉特旗',
            value: '152223',
            children: null,
          },
          {
            label: '突泉县',
            value: '152224',
            children: null,
          },
        ],
      },
      {
        label: '锡林郭勒盟',
        value: '152500',
        children: [
          {
            label: '二连浩特市',
            value: '152501',
            children: null,
          },
          {
            label: '锡林浩特市',
            value: '152502',
            children: null,
          },
          {
            label: '阿巴嘎旗',
            value: '152522',
            children: null,
          },
          {
            label: '苏尼特左旗',
            value: '152523',
            children: null,
          },
          {
            label: '苏尼特右旗',
            value: '152524',
            children: null,
          },
          {
            label: '东乌珠穆沁旗',
            value: '152525',
            children: null,
          },
          {
            label: '西乌珠穆沁旗',
            value: '152526',
            children: null,
          },
          {
            label: '太仆寺旗',
            value: '152527',
            children: null,
          },
          {
            label: '镶黄旗',
            value: '152528',
            children: null,
          },
          {
            label: '正镶白旗',
            value: '152529',
            children: null,
          },
          {
            label: '正蓝旗',
            value: '152530',
            children: null,
          },
          {
            label: '多伦县',
            value: '152531',
            children: null,
          },
        ],
      },
      {
        label: '阿拉善盟',
        value: '152900',
        children: [
          {
            label: '阿拉善左旗',
            value: '152921',
            children: null,
          },
          {
            label: '阿拉善右旗',
            value: '152922',
            children: null,
          },
          {
            label: '额济纳旗',
            value: '152923',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '辽宁省',
    value: '210000',
    children: [
      {
        label: '沈阳市',
        value: '210100',
        children: [
          {
            label: '和平区',
            value: '210102',
            children: null,
          },
          {
            label: '沈河区',
            value: '210103',
            children: null,
          },
          {
            label: '大东区',
            value: '210104',
            children: null,
          },
          {
            label: '皇姑区',
            value: '210105',
            children: null,
          },
          {
            label: '铁西区',
            value: '210106',
            children: null,
          },
          {
            label: '苏家屯区',
            value: '210111',
            children: null,
          },
          {
            label: '浑南区',
            value: '210112',
            children: null,
          },
          {
            label: '沈北新区',
            value: '210113',
            children: null,
          },
          {
            label: '于洪区',
            value: '210114',
            children: null,
          },
          {
            label: '辽中区',
            value: '210115',
            children: null,
          },
          {
            label: '康平县',
            value: '210123',
            children: null,
          },
          {
            label: '法库县',
            value: '210124',
            children: null,
          },
          {
            label: '新民市',
            value: '210181',
            children: null,
          },
        ],
      },
      {
        label: '大连市',
        value: '210200',
        children: [
          {
            label: '中山区',
            value: '210202',
            children: null,
          },
          {
            label: '西岗区',
            value: '210203',
            children: null,
          },
          {
            label: '沙河口区',
            value: '210204',
            children: null,
          },
          {
            label: '甘井子区',
            value: '210211',
            children: null,
          },
          {
            label: '旅顺口区',
            value: '210212',
            children: null,
          },
          {
            label: '金州区',
            value: '210213',
            children: null,
          },
          {
            label: '普兰店区',
            value: '210214',
            children: null,
          },
          {
            label: '长海县',
            value: '210224',
            children: null,
          },
          {
            label: '瓦房店市',
            value: '210281',
            children: null,
          },
          {
            label: '庄河市',
            value: '210283',
            children: null,
          },
        ],
      },
      {
        label: '鞍山市',
        value: '210300',
        children: [
          {
            label: '铁东区',
            value: '210302',
            children: null,
          },
          {
            label: '铁西区',
            value: '210303',
            children: null,
          },
          {
            label: '立山区',
            value: '210304',
            children: null,
          },
          {
            label: '千山区',
            value: '210311',
            children: null,
          },
          {
            label: '台安县',
            value: '210321',
            children: null,
          },
          {
            label: '岫岩满族自治县',
            value: '210323',
            children: null,
          },
          {
            label: '海城市',
            value: '210381',
            children: null,
          },
        ],
      },
      {
        label: '抚顺市',
        value: '210400',
        children: [
          {
            label: '新抚区',
            value: '210402',
            children: null,
          },
          {
            label: '东洲区',
            value: '210403',
            children: null,
          },
          {
            label: '望花区',
            value: '210404',
            children: null,
          },
          {
            label: '顺城区',
            value: '210411',
            children: null,
          },
          {
            label: '抚顺县',
            value: '210421',
            children: null,
          },
          {
            label: '新宾满族自治县',
            value: '210422',
            children: null,
          },
          {
            label: '清原满族自治县',
            value: '210423',
            children: null,
          },
        ],
      },
      {
        label: '本溪市',
        value: '210500',
        children: [
          {
            label: '平山区',
            value: '210502',
            children: null,
          },
          {
            label: '溪湖区',
            value: '210503',
            children: null,
          },
          {
            label: '明山区',
            value: '210504',
            children: null,
          },
          {
            label: '南芬区',
            value: '210505',
            children: null,
          },
          {
            label: '本溪满族自治县',
            value: '210521',
            children: null,
          },
          {
            label: '桓仁满族自治县',
            value: '210522',
            children: null,
          },
        ],
      },
      {
        label: '丹东市',
        value: '210600',
        children: [
          {
            label: '元宝区',
            value: '210602',
            children: null,
          },
          {
            label: '振兴区',
            value: '210603',
            children: null,
          },
          {
            label: '振安区',
            value: '210604',
            children: null,
          },
          {
            label: '宽甸满族自治县',
            value: '210624',
            children: null,
          },
          {
            label: '东港市',
            value: '210681',
            children: null,
          },
          {
            label: '凤城市',
            value: '210682',
            children: null,
          },
        ],
      },
      {
        label: '锦州市',
        value: '210700',
        children: [
          {
            label: '古塔区',
            value: '210702',
            children: null,
          },
          {
            label: '凌河区',
            value: '210703',
            children: null,
          },
          {
            label: '太和区',
            value: '210711',
            children: null,
          },
          {
            label: '黑山县',
            value: '210726',
            children: null,
          },
          {
            label: '义县',
            value: '210727',
            children: null,
          },
          {
            label: '凌海市',
            value: '210781',
            children: null,
          },
          {
            label: '北镇市',
            value: '210782',
            children: null,
          },
        ],
      },
      {
        label: '营口市',
        value: '210800',
        children: [
          {
            label: '站前区',
            value: '210802',
            children: null,
          },
          {
            label: '西市区',
            value: '210803',
            children: null,
          },
          {
            label: '鲅鱼圈区',
            value: '210804',
            children: null,
          },
          {
            label: '老边区',
            value: '210811',
            children: null,
          },
          {
            label: '盖州市',
            value: '210881',
            children: null,
          },
          {
            label: '大石桥市',
            value: '210882',
            children: null,
          },
        ],
      },
      {
        label: '阜新市',
        value: '210900',
        children: [
          {
            label: '海州区',
            value: '210902',
            children: null,
          },
          {
            label: '新邱区',
            value: '210903',
            children: null,
          },
          {
            label: '太平区',
            value: '210904',
            children: null,
          },
          {
            label: '清河门区',
            value: '210905',
            children: null,
          },
          {
            label: '细河区',
            value: '210911',
            children: null,
          },
          {
            label: '阜新蒙古族自治县',
            value: '210921',
            children: null,
          },
          {
            label: '彰武县',
            value: '210922',
            children: null,
          },
        ],
      },
      {
        label: '辽阳市',
        value: '211000',
        children: [
          {
            label: '白塔区',
            value: '211002',
            children: null,
          },
          {
            label: '文圣区',
            value: '211003',
            children: null,
          },
          {
            label: '宏伟区',
            value: '211004',
            children: null,
          },
          {
            label: '弓长岭区',
            value: '211005',
            children: null,
          },
          {
            label: '太子河区',
            value: '211011',
            children: null,
          },
          {
            label: '辽阳县',
            value: '211021',
            children: null,
          },
          {
            label: '灯塔市',
            value: '211081',
            children: null,
          },
        ],
      },
      {
        label: '盘锦市',
        value: '211100',
        children: [
          {
            label: '双台子区',
            value: '211102',
            children: null,
          },
          {
            label: '兴隆台区',
            value: '211103',
            children: null,
          },
          {
            label: '大洼区',
            value: '211104',
            children: null,
          },
          {
            label: '盘山县',
            value: '211122',
            children: null,
          },
        ],
      },
      {
        label: '铁岭市',
        value: '211200',
        children: [
          {
            label: '银州区',
            value: '211202',
            children: null,
          },
          {
            label: '清河区',
            value: '211204',
            children: null,
          },
          {
            label: '铁岭县',
            value: '211221',
            children: null,
          },
          {
            label: '西丰县',
            value: '211223',
            children: null,
          },
          {
            label: '昌图县',
            value: '211224',
            children: null,
          },
          {
            label: '调兵山市',
            value: '211281',
            children: null,
          },
          {
            label: '开原市',
            value: '211282',
            children: null,
          },
        ],
      },
      {
        label: '朝阳市',
        value: '211300',
        children: [
          {
            label: '双塔区',
            value: '211302',
            children: null,
          },
          {
            label: '龙城区',
            value: '211303',
            children: null,
          },
          {
            label: '朝阳县',
            value: '211321',
            children: null,
          },
          {
            label: '建平县',
            value: '211322',
            children: null,
          },
          {
            label: '喀喇沁左翼蒙古族自治县',
            value: '211324',
            children: null,
          },
          {
            label: '北票市',
            value: '211381',
            children: null,
          },
          {
            label: '凌源市',
            value: '211382',
            children: null,
          },
        ],
      },
      {
        label: '葫芦岛市',
        value: '211400',
        children: [
          {
            label: '连山区',
            value: '211402',
            children: null,
          },
          {
            label: '龙港区',
            value: '211403',
            children: null,
          },
          {
            label: '南票区',
            value: '211404',
            children: null,
          },
          {
            label: '绥中县',
            value: '211421',
            children: null,
          },
          {
            label: '建昌县',
            value: '211422',
            children: null,
          },
          {
            label: '兴城市',
            value: '211481',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '吉林省',
    value: '220000',
    children: [
      {
        label: '长春市',
        value: '220100',
        children: [
          {
            label: '南关区',
            value: '220102',
            children: null,
          },
          {
            label: '宽城区',
            value: '220103',
            children: null,
          },
          {
            label: '朝阳区',
            value: '220104',
            children: null,
          },
          {
            label: '二道区',
            value: '220105',
            children: null,
          },
          {
            label: '绿园区',
            value: '220106',
            children: null,
          },
          {
            label: '双阳区',
            value: '220112',
            children: null,
          },
          {
            label: '九台区',
            value: '220113',
            children: null,
          },
          {
            label: '农安县',
            value: '220122',
            children: null,
          },
          {
            label: '榆树市',
            value: '220182',
            children: null,
          },
          {
            label: '德惠市',
            value: '220183',
            children: null,
          },
        ],
      },
      {
        label: '吉林市',
        value: '220200',
        children: [
          {
            label: '昌邑区',
            value: '220202',
            children: null,
          },
          {
            label: '龙潭区',
            value: '220203',
            children: null,
          },
          {
            label: '船营区',
            value: '220204',
            children: null,
          },
          {
            label: '丰满区',
            value: '220211',
            children: null,
          },
          {
            label: '永吉县',
            value: '220221',
            children: null,
          },
          {
            label: '蛟河市',
            value: '220281',
            children: null,
          },
          {
            label: '桦甸市',
            value: '220282',
            children: null,
          },
          {
            label: '舒兰市',
            value: '220283',
            children: null,
          },
          {
            label: '磐石市',
            value: '220284',
            children: null,
          },
        ],
      },
      {
        label: '四平市',
        value: '220300',
        children: [
          {
            label: '铁西区',
            value: '220302',
            children: null,
          },
          {
            label: '铁东区',
            value: '220303',
            children: null,
          },
          {
            label: '梨树县',
            value: '220322',
            children: null,
          },
          {
            label: '伊通满族自治县',
            value: '220323',
            children: null,
          },
          {
            label: '公主岭市',
            value: '220381',
            children: null,
          },
          {
            label: '双辽市',
            value: '220382',
            children: null,
          },
        ],
      },
      {
        label: '辽源市',
        value: '220400',
        children: [
          {
            label: '龙山区',
            value: '220402',
            children: null,
          },
          {
            label: '西安区',
            value: '220403',
            children: null,
          },
          {
            label: '东丰县',
            value: '220421',
            children: null,
          },
          {
            label: '东辽县',
            value: '220422',
            children: null,
          },
        ],
      },
      {
        label: '通化市',
        value: '220500',
        children: [
          {
            label: '东昌区',
            value: '220502',
            children: null,
          },
          {
            label: '二道江区',
            value: '220503',
            children: null,
          },
          {
            label: '通化县',
            value: '220521',
            children: null,
          },
          {
            label: '辉南县',
            value: '220523',
            children: null,
          },
          {
            label: '柳河县',
            value: '220524',
            children: null,
          },
          {
            label: '梅河口市',
            value: '220581',
            children: null,
          },
          {
            label: '集安市',
            value: '220582',
            children: null,
          },
        ],
      },
      {
        label: '白山市',
        value: '220600',
        children: [
          {
            label: '浑江区',
            value: '220602',
            children: null,
          },
          {
            label: '江源区',
            value: '220605',
            children: null,
          },
          {
            label: '抚松县',
            value: '220621',
            children: null,
          },
          {
            label: '靖宇县',
            value: '220622',
            children: null,
          },
          {
            label: '长白朝鲜族自治县',
            value: '220623',
            children: null,
          },
          {
            label: '临江市',
            value: '220681',
            children: null,
          },
        ],
      },
      {
        label: '松原市',
        value: '220700',
        children: [
          {
            label: '宁江区',
            value: '220702',
            children: null,
          },
          {
            label: '前郭尔罗斯蒙古族自治县',
            value: '220721',
            children: null,
          },
          {
            label: '长岭县',
            value: '220722',
            children: null,
          },
          {
            label: '乾安县',
            value: '220723',
            children: null,
          },
          {
            label: '扶余市',
            value: '220781',
            children: null,
          },
        ],
      },
      {
        label: '白城市',
        value: '220800',
        children: [
          {
            label: '洮北区',
            value: '220802',
            children: null,
          },
          {
            label: '镇赉县',
            value: '220821',
            children: null,
          },
          {
            label: '通榆县',
            value: '220822',
            children: null,
          },
          {
            label: '洮南市',
            value: '220881',
            children: null,
          },
          {
            label: '大安市',
            value: '220882',
            children: null,
          },
        ],
      },
      {
        label: '延边朝鲜族自治州',
        value: '222400',
        children: [
          {
            label: '延吉市',
            value: '222401',
            children: null,
          },
          {
            label: '图们市',
            value: '222402',
            children: null,
          },
          {
            label: '敦化市',
            value: '222403',
            children: null,
          },
          {
            label: '珲春市',
            value: '222404',
            children: null,
          },
          {
            label: '龙井市',
            value: '222405',
            children: null,
          },
          {
            label: '和龙市',
            value: '222406',
            children: null,
          },
          {
            label: '汪清县',
            value: '222424',
            children: null,
          },
          {
            label: '安图县',
            value: '222426',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '黑龙江省',
    value: '230000',
    children: [
      {
        label: '哈尔滨市',
        value: '230100',
        children: [
          {
            label: '道里区',
            value: '230102',
            children: null,
          },
          {
            label: '南岗区',
            value: '230103',
            children: null,
          },
          {
            label: '道外区',
            value: '230104',
            children: null,
          },
          {
            label: '平房区',
            value: '230108',
            children: null,
          },
          {
            label: '松北区',
            value: '230109',
            children: null,
          },
          {
            label: '香坊区',
            value: '230110',
            children: null,
          },
          {
            label: '呼兰区',
            value: '230111',
            children: null,
          },
          {
            label: '阿城区',
            value: '230112',
            children: null,
          },
          {
            label: '双城区',
            value: '230113',
            children: null,
          },
          {
            label: '依兰县',
            value: '230123',
            children: null,
          },
          {
            label: '方正县',
            value: '230124',
            children: null,
          },
          {
            label: '宾县',
            value: '230125',
            children: null,
          },
          {
            label: '巴彦县',
            value: '230126',
            children: null,
          },
          {
            label: '木兰县',
            value: '230127',
            children: null,
          },
          {
            label: '通河县',
            value: '230128',
            children: null,
          },
          {
            label: '延寿县',
            value: '230129',
            children: null,
          },
          {
            label: '尚志市',
            value: '230183',
            children: null,
          },
          {
            label: '五常市',
            value: '230184',
            children: null,
          },
        ],
      },
      {
        label: '齐齐哈尔市',
        value: '230200',
        children: [
          {
            label: '龙沙区',
            value: '230202',
            children: null,
          },
          {
            label: '建华区',
            value: '230203',
            children: null,
          },
          {
            label: '铁锋区',
            value: '230204',
            children: null,
          },
          {
            label: '昂昂溪区',
            value: '230205',
            children: null,
          },
          {
            label: '富拉尔基区',
            value: '230206',
            children: null,
          },
          {
            label: '碾子山区',
            value: '230207',
            children: null,
          },
          {
            label: '梅里斯达斡尔族区',
            value: '230208',
            children: null,
          },
          {
            label: '龙江县',
            value: '230221',
            children: null,
          },
          {
            label: '依安县',
            value: '230223',
            children: null,
          },
          {
            label: '泰来县',
            value: '230224',
            children: null,
          },
          {
            label: '甘南县',
            value: '230225',
            children: null,
          },
          {
            label: '富裕县',
            value: '230227',
            children: null,
          },
          {
            label: '克山县',
            value: '230229',
            children: null,
          },
          {
            label: '克东县',
            value: '230230',
            children: null,
          },
          {
            label: '拜泉县',
            value: '230231',
            children: null,
          },
          {
            label: '讷河市',
            value: '230281',
            children: null,
          },
        ],
      },
      {
        label: '鸡西市',
        value: '230300',
        children: [
          {
            label: '鸡冠区',
            value: '230302',
            children: null,
          },
          {
            label: '恒山区',
            value: '230303',
            children: null,
          },
          {
            label: '滴道区',
            value: '230304',
            children: null,
          },
          {
            label: '梨树区',
            value: '230305',
            children: null,
          },
          {
            label: '城子河区',
            value: '230306',
            children: null,
          },
          {
            label: '麻山区',
            value: '230307',
            children: null,
          },
          {
            label: '鸡东县',
            value: '230321',
            children: null,
          },
          {
            label: '虎林市',
            value: '230381',
            children: null,
          },
          {
            label: '密山市',
            value: '230382',
            children: null,
          },
        ],
      },
      {
        label: '鹤岗市',
        value: '230400',
        children: [
          {
            label: '向阳区',
            value: '230402',
            children: null,
          },
          {
            label: '工农区',
            value: '230403',
            children: null,
          },
          {
            label: '南山区',
            value: '230404',
            children: null,
          },
          {
            label: '兴安区',
            value: '230405',
            children: null,
          },
          {
            label: '东山区',
            value: '230406',
            children: null,
          },
          {
            label: '兴山区',
            value: '230407',
            children: null,
          },
          {
            label: '萝北县',
            value: '230421',
            children: null,
          },
          {
            label: '绥滨县',
            value: '230422',
            children: null,
          },
        ],
      },
      {
        label: '双鸭山市',
        value: '230500',
        children: [
          {
            label: '尖山区',
            value: '230502',
            children: null,
          },
          {
            label: '岭东区',
            value: '230503',
            children: null,
          },
          {
            label: '四方台区',
            value: '230505',
            children: null,
          },
          {
            label: '宝山区',
            value: '230506',
            children: null,
          },
          {
            label: '集贤县',
            value: '230521',
            children: null,
          },
          {
            label: '友谊县',
            value: '230522',
            children: null,
          },
          {
            label: '宝清县',
            value: '230523',
            children: null,
          },
          {
            label: '饶河县',
            value: '230524',
            children: null,
          },
        ],
      },
      {
        label: '大庆市',
        value: '230600',
        children: [
          {
            label: '萨尔图区',
            value: '230602',
            children: null,
          },
          {
            label: '龙凤区',
            value: '230603',
            children: null,
          },
          {
            label: '让胡路区',
            value: '230604',
            children: null,
          },
          {
            label: '红岗区',
            value: '230605',
            children: null,
          },
          {
            label: '大同区',
            value: '230606',
            children: null,
          },
          {
            label: '肇州县',
            value: '230621',
            children: null,
          },
          {
            label: '肇源县',
            value: '230622',
            children: null,
          },
          {
            label: '林甸县',
            value: '230623',
            children: null,
          },
          {
            label: '杜尔伯特蒙古族自治县',
            value: '230624',
            children: null,
          },
        ],
      },
      {
        label: '伊春市',
        value: '230700',
        children: [
          {
            label: '伊春区',
            value: '230702',
            children: null,
          },
          {
            label: '南岔区',
            value: '230703',
            children: null,
          },
          {
            label: '友好区',
            value: '230704',
            children: null,
          },
          {
            label: '西林区',
            value: '230705',
            children: null,
          },
          {
            label: '翠峦区',
            value: '230706',
            children: null,
          },
          {
            label: '新青区',
            value: '230707',
            children: null,
          },
          {
            label: '美溪区',
            value: '230708',
            children: null,
          },
          {
            label: '金山屯区',
            value: '230709',
            children: null,
          },
          {
            label: '五营区',
            value: '230710',
            children: null,
          },
          {
            label: '乌马河区',
            value: '230711',
            children: null,
          },
          {
            label: '汤旺河区',
            value: '230712',
            children: null,
          },
          {
            label: '带岭区',
            value: '230713',
            children: null,
          },
          {
            label: '乌伊岭区',
            value: '230714',
            children: null,
          },
          {
            label: '红星区',
            value: '230715',
            children: null,
          },
          {
            label: '上甘岭区',
            value: '230716',
            children: null,
          },
          {
            label: '嘉荫县',
            value: '230722',
            children: null,
          },
          {
            label: '铁力市',
            value: '230781',
            children: null,
          },
        ],
      },
      {
        label: '佳木斯市',
        value: '230800',
        children: [
          {
            label: '向阳区',
            value: '230803',
            children: null,
          },
          {
            label: '前进区',
            value: '230804',
            children: null,
          },
          {
            label: '东风区',
            value: '230805',
            children: null,
          },
          {
            label: '郊区',
            value: '230811',
            children: null,
          },
          {
            label: '桦南县',
            value: '230822',
            children: null,
          },
          {
            label: '桦川县',
            value: '230826',
            children: null,
          },
          {
            label: '汤原县',
            value: '230828',
            children: null,
          },
          {
            label: '同江市',
            value: '230881',
            children: null,
          },
          {
            label: '富锦市',
            value: '230882',
            children: null,
          },
          {
            label: '抚远市',
            value: '230883',
            children: null,
          },
        ],
      },
      {
        label: '七台河市',
        value: '230900',
        children: [
          {
            label: '新兴区',
            value: '230902',
            children: null,
          },
          {
            label: '桃山区',
            value: '230903',
            children: null,
          },
          {
            label: '茄子河区',
            value: '230904',
            children: null,
          },
          {
            label: '勃利县',
            value: '230921',
            children: null,
          },
        ],
      },
      {
        label: '牡丹江市',
        value: '231000',
        children: [
          {
            label: '东安区',
            value: '231002',
            children: null,
          },
          {
            label: '阳明区',
            value: '231003',
            children: null,
          },
          {
            label: '爱民区',
            value: '231004',
            children: null,
          },
          {
            label: '西安区',
            value: '231005',
            children: null,
          },
          {
            label: '林口县',
            value: '231025',
            children: null,
          },
          {
            label: '绥芬河市',
            value: '231081',
            children: null,
          },
          {
            label: '海林市',
            value: '231083',
            children: null,
          },
          {
            label: '宁安市',
            value: '231084',
            children: null,
          },
          {
            label: '穆棱市',
            value: '231085',
            children: null,
          },
          {
            label: '东宁市',
            value: '231086',
            children: null,
          },
        ],
      },
      {
        label: '黑河市',
        value: '231100',
        children: [
          {
            label: '爱辉区',
            value: '231102',
            children: null,
          },
          {
            label: '嫩江县',
            value: '231121',
            children: null,
          },
          {
            label: '逊克县',
            value: '231123',
            children: null,
          },
          {
            label: '孙吴县',
            value: '231124',
            children: null,
          },
          {
            label: '北安市',
            value: '231181',
            children: null,
          },
          {
            label: '五大连池市',
            value: '231182',
            children: null,
          },
        ],
      },
      {
        label: '绥化市',
        value: '231200',
        children: [
          {
            label: '北林区',
            value: '231202',
            children: null,
          },
          {
            label: '望奎县',
            value: '231221',
            children: null,
          },
          {
            label: '兰西县',
            value: '231222',
            children: null,
          },
          {
            label: '青冈县',
            value: '231223',
            children: null,
          },
          {
            label: '庆安县',
            value: '231224',
            children: null,
          },
          {
            label: '明水县',
            value: '231225',
            children: null,
          },
          {
            label: '绥棱县',
            value: '231226',
            children: null,
          },
          {
            label: '安达市',
            value: '231281',
            children: null,
          },
          {
            label: '肇东市',
            value: '231282',
            children: null,
          },
          {
            label: '海伦市',
            value: '231283',
            children: null,
          },
        ],
      },
      {
        label: '大兴安岭地区',
        value: '232700',
        children: [
          {
            label: '漠河市',
            value: '232701',
            children: null,
          },
          {
            label: '呼玛县',
            value: '232721',
            children: null,
          },
          {
            label: '塔河县',
            value: '232722',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '上海市',
    value: '310000',
    children: [
      {
        label: '上海市',
        value: '310100',
        children: [
          {
            label: '黄浦区',
            value: '310101',
            children: null,
          },
          {
            label: '徐汇区',
            value: '310104',
            children: null,
          },
          {
            label: '长宁区',
            value: '310105',
            children: null,
          },
          {
            label: '静安区',
            value: '310106',
            children: null,
          },
          {
            label: '普陀区',
            value: '310107',
            children: null,
          },
          {
            label: '虹口区',
            value: '310109',
            children: null,
          },
          {
            label: '杨浦区',
            value: '310110',
            children: null,
          },
          {
            label: '闵行区',
            value: '310112',
            children: null,
          },
          {
            label: '宝山区',
            value: '310113',
            children: null,
          },
          {
            label: '嘉定区',
            value: '310114',
            children: null,
          },
          {
            label: '浦东新区',
            value: '310115',
            children: null,
          },
          {
            label: '金山区',
            value: '310116',
            children: null,
          },
          {
            label: '松江区',
            value: '310117',
            children: null,
          },
          {
            label: '青浦区',
            value: '310118',
            children: null,
          },
          {
            label: '奉贤区',
            value: '310120',
            children: null,
          },
          {
            label: '崇明区',
            value: '310151',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '江苏省',
    value: '320000',
    children: [
      {
        label: '南京市',
        value: '320100',
        children: [
          {
            label: '玄武区',
            value: '320102',
            children: null,
          },
          {
            label: '秦淮区',
            value: '320104',
            children: null,
          },
          {
            label: '建邺区',
            value: '320105',
            children: null,
          },
          {
            label: '鼓楼区',
            value: '320106',
            children: null,
          },
          {
            label: '浦口区',
            value: '320111',
            children: null,
          },
          {
            label: '栖霞区',
            value: '320113',
            children: null,
          },
          {
            label: '雨花台区',
            value: '320114',
            children: null,
          },
          {
            label: '江宁区',
            value: '320115',
            children: null,
          },
          {
            label: '六合区',
            value: '320116',
            children: null,
          },
          {
            label: '溧水区',
            value: '320117',
            children: null,
          },
          {
            label: '高淳区',
            value: '320118',
            children: null,
          },
        ],
      },
      {
        label: '无锡市',
        value: '320200',
        children: [
          {
            label: '锡山区',
            value: '320205',
            children: null,
          },
          {
            label: '惠山区',
            value: '320206',
            children: null,
          },
          {
            label: '滨湖区',
            value: '320211',
            children: null,
          },
          {
            label: '梁溪区',
            value: '320213',
            children: null,
          },
          {
            label: '新吴区',
            value: '320214',
            children: null,
          },
          {
            label: '江阴市',
            value: '320281',
            children: null,
          },
          {
            label: '宜兴市',
            value: '320282',
            children: null,
          },
        ],
      },
      {
        label: '徐州市',
        value: '320300',
        children: [
          {
            label: '鼓楼区',
            value: '320302',
            children: null,
          },
          {
            label: '云龙区',
            value: '320303',
            children: null,
          },
          {
            label: '贾汪区',
            value: '320305',
            children: null,
          },
          {
            label: '泉山区',
            value: '320311',
            children: null,
          },
          {
            label: '铜山区',
            value: '320312',
            children: null,
          },
          {
            label: '丰县',
            value: '320321',
            children: null,
          },
          {
            label: '沛县',
            value: '320322',
            children: null,
          },
          {
            label: '睢宁县',
            value: '320324',
            children: null,
          },
          {
            label: '新沂市',
            value: '320381',
            children: null,
          },
          {
            label: '邳州市',
            value: '320382',
            children: null,
          },
        ],
      },
      {
        label: '常州市',
        value: '320400',
        children: [
          {
            label: '天宁区',
            value: '320402',
            children: null,
          },
          {
            label: '钟楼区',
            value: '320404',
            children: null,
          },
          {
            label: '新北区',
            value: '320411',
            children: null,
          },
          {
            label: '武进区',
            value: '320412',
            children: null,
          },
          {
            label: '金坛区',
            value: '320413',
            children: null,
          },
          {
            label: '溧阳市',
            value: '320481',
            children: null,
          },
        ],
      },
      {
        label: '苏州市',
        value: '320500',
        children: [
          {
            label: '虎丘区',
            value: '320505',
            children: null,
          },
          {
            label: '吴中区',
            value: '320506',
            children: null,
          },
          {
            label: '相城区',
            value: '320507',
            children: null,
          },
          {
            label: '姑苏区',
            value: '320508',
            children: null,
          },
          {
            label: '吴江区',
            value: '320509',
            children: null,
          },
          {
            label: '常熟市',
            value: '320581',
            children: null,
          },
          {
            label: '张家港市',
            value: '320582',
            children: null,
          },
          {
            label: '昆山市',
            value: '320583',
            children: null,
          },
          {
            label: '太仓市',
            value: '320585',
            children: null,
          },
        ],
      },
      {
        label: '南通市',
        value: '320600',
        children: [
          {
            label: '崇川区',
            value: '320602',
            children: null,
          },
          {
            label: '港闸区',
            value: '320611',
            children: null,
          },
          {
            label: '通州区',
            value: '320612',
            children: null,
          },
          {
            label: '如东县',
            value: '320623',
            children: null,
          },
          {
            label: '启东市',
            value: '320681',
            children: null,
          },
          {
            label: '如皋市',
            value: '320682',
            children: null,
          },
          {
            label: '海门市',
            value: '320684',
            children: null,
          },
          {
            label: '海安市',
            value: '320685',
            children: null,
          },
        ],
      },
      {
        label: '连云港市',
        value: '320700',
        children: [
          {
            label: '连云区',
            value: '320703',
            children: null,
          },
          {
            label: '海州区',
            value: '320706',
            children: null,
          },
          {
            label: '赣榆区',
            value: '320707',
            children: null,
          },
          {
            label: '东海县',
            value: '320722',
            children: null,
          },
          {
            label: '灌云县',
            value: '320723',
            children: null,
          },
          {
            label: '灌南县',
            value: '320724',
            children: null,
          },
        ],
      },
      {
        label: '淮安市',
        value: '320800',
        children: [
          {
            label: '淮安区',
            value: '320803',
            children: null,
          },
          {
            label: '淮阴区',
            value: '320804',
            children: null,
          },
          {
            label: '清江浦区',
            value: '320812',
            children: null,
          },
          {
            label: '洪泽区',
            value: '320813',
            children: null,
          },
          {
            label: '涟水县',
            value: '320826',
            children: null,
          },
          {
            label: '盱眙县',
            value: '320830',
            children: null,
          },
          {
            label: '金湖县',
            value: '320831',
            children: null,
          },
        ],
      },
      {
        label: '盐城市',
        value: '320900',
        children: [
          {
            label: '亭湖区',
            value: '320902',
            children: null,
          },
          {
            label: '盐都区',
            value: '320903',
            children: null,
          },
          {
            label: '大丰区',
            value: '320904',
            children: null,
          },
          {
            label: '响水县',
            value: '320921',
            children: null,
          },
          {
            label: '滨海县',
            value: '320922',
            children: null,
          },
          {
            label: '阜宁县',
            value: '320923',
            children: null,
          },
          {
            label: '射阳县',
            value: '320924',
            children: null,
          },
          {
            label: '建湖县',
            value: '320925',
            children: null,
          },
          {
            label: '东台市',
            value: '320981',
            children: null,
          },
        ],
      },
      {
        label: '扬州市',
        value: '321000',
        children: [
          {
            label: '广陵区',
            value: '321002',
            children: null,
          },
          {
            label: '邗江区',
            value: '321003',
            children: null,
          },
          {
            label: '江都区',
            value: '321012',
            children: null,
          },
          {
            label: '宝应县',
            value: '321023',
            children: null,
          },
          {
            label: '仪征市',
            value: '321081',
            children: null,
          },
          {
            label: '高邮市',
            value: '321084',
            children: null,
          },
        ],
      },
      {
        label: '镇江市',
        value: '321100',
        children: [
          {
            label: '京口区',
            value: '321102',
            children: null,
          },
          {
            label: '润州区',
            value: '321111',
            children: null,
          },
          {
            label: '丹徒区',
            value: '321112',
            children: null,
          },
          {
            label: '丹阳市',
            value: '321181',
            children: null,
          },
          {
            label: '扬中市',
            value: '321182',
            children: null,
          },
          {
            label: '句容市',
            value: '321183',
            children: null,
          },
        ],
      },
      {
        label: '泰州市',
        value: '321200',
        children: [
          {
            label: '海陵区',
            value: '321202',
            children: null,
          },
          {
            label: '高港区',
            value: '321203',
            children: null,
          },
          {
            label: '姜堰区',
            value: '321204',
            children: null,
          },
          {
            label: '兴化市',
            value: '321281',
            children: null,
          },
          {
            label: '靖江市',
            value: '321282',
            children: null,
          },
          {
            label: '泰兴市',
            value: '321283',
            children: null,
          },
        ],
      },
      {
        label: '宿迁市',
        value: '321300',
        children: [
          {
            label: '宿城区',
            value: '321302',
            children: null,
          },
          {
            label: '宿豫区',
            value: '321311',
            children: null,
          },
          {
            label: '沭阳县',
            value: '321322',
            children: null,
          },
          {
            label: '泗阳县',
            value: '321323',
            children: null,
          },
          {
            label: '泗洪县',
            value: '321324',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '浙江省',
    value: '330000',
    children: [
      {
        label: '杭州市',
        value: '330100',
        children: [
          {
            label: '上城区',
            value: '330102',
            children: null,
          },
          {
            label: '下城区',
            value: '330103',
            children: null,
          },
          {
            label: '江干区',
            value: '330104',
            children: null,
          },
          {
            label: '拱墅区',
            value: '330105',
            children: null,
          },
          {
            label: '西湖区',
            value: '330106',
            children: null,
          },
          {
            label: '滨江区',
            value: '330108',
            children: null,
          },
          {
            label: '萧山区',
            value: '330109',
            children: null,
          },
          {
            label: '余杭区',
            value: '330110',
            children: null,
          },
          {
            label: '富阳区',
            value: '330111',
            children: null,
          },
          {
            label: '临安区',
            value: '330112',
            children: null,
          },
          {
            label: '桐庐县',
            value: '330122',
            children: null,
          },
          {
            label: '淳安县',
            value: '330127',
            children: null,
          },
          {
            label: '建德市',
            value: '330182',
            children: null,
          },
        ],
      },
      {
        label: '宁波市',
        value: '330200',
        children: [
          {
            label: '海曙区',
            value: '330203',
            children: null,
          },
          {
            label: '江北区',
            value: '330205',
            children: null,
          },
          {
            label: '北仑区',
            value: '330206',
            children: null,
          },
          {
            label: '镇海区',
            value: '330211',
            children: null,
          },
          {
            label: '鄞州区',
            value: '330212',
            children: null,
          },
          {
            label: '奉化区',
            value: '330213',
            children: null,
          },
          {
            label: '象山县',
            value: '330225',
            children: null,
          },
          {
            label: '宁海县',
            value: '330226',
            children: null,
          },
          {
            label: '余姚市',
            value: '330281',
            children: null,
          },
          {
            label: '慈溪市',
            value: '330282',
            children: null,
          },
        ],
      },
      {
        label: '温州市',
        value: '330300',
        children: [
          {
            label: '鹿城区',
            value: '330302',
            children: null,
          },
          {
            label: '龙湾区',
            value: '330303',
            children: null,
          },
          {
            label: '瓯海区',
            value: '330304',
            children: null,
          },
          {
            label: '洞头区',
            value: '330305',
            children: null,
          },
          {
            label: '永嘉县',
            value: '330324',
            children: null,
          },
          {
            label: '平阳县',
            value: '330326',
            children: null,
          },
          {
            label: '苍南县',
            value: '330327',
            children: null,
          },
          {
            label: '文成县',
            value: '330328',
            children: null,
          },
          {
            label: '泰顺县',
            value: '330329',
            children: null,
          },
          {
            label: '瑞安市',
            value: '330381',
            children: null,
          },
          {
            label: '乐清市',
            value: '330382',
            children: null,
          },
        ],
      },
      {
        label: '嘉兴市',
        value: '330400',
        children: [
          {
            label: '南湖区',
            value: '330402',
            children: null,
          },
          {
            label: '秀洲区',
            value: '330411',
            children: null,
          },
          {
            label: '嘉善县',
            value: '330421',
            children: null,
          },
          {
            label: '海盐县',
            value: '330424',
            children: null,
          },
          {
            label: '海宁市',
            value: '330481',
            children: null,
          },
          {
            label: '平湖市',
            value: '330482',
            children: null,
          },
          {
            label: '桐乡市',
            value: '330483',
            children: null,
          },
        ],
      },
      {
        label: '湖州市',
        value: '330500',
        children: [
          {
            label: '吴兴区',
            value: '330502',
            children: null,
          },
          {
            label: '南浔区',
            value: '330503',
            children: null,
          },
          {
            label: '德清县',
            value: '330521',
            children: null,
          },
          {
            label: '长兴县',
            value: '330522',
            children: null,
          },
          {
            label: '安吉县',
            value: '330523',
            children: null,
          },
        ],
      },
      {
        label: '绍兴市',
        value: '330600',
        children: [
          {
            label: '越城区',
            value: '330602',
            children: null,
          },
          {
            label: '柯桥区',
            value: '330603',
            children: null,
          },
          {
            label: '上虞区',
            value: '330604',
            children: null,
          },
          {
            label: '新昌县',
            value: '330624',
            children: null,
          },
          {
            label: '诸暨市',
            value: '330681',
            children: null,
          },
          {
            label: '嵊州市',
            value: '330683',
            children: null,
          },
        ],
      },
      {
        label: '金华市',
        value: '330700',
        children: [
          {
            label: '婺城区',
            value: '330702',
            children: null,
          },
          {
            label: '金东区',
            value: '330703',
            children: null,
          },
          {
            label: '武义县',
            value: '330723',
            children: null,
          },
          {
            label: '浦江县',
            value: '330726',
            children: null,
          },
          {
            label: '磐安县',
            value: '330727',
            children: null,
          },
          {
            label: '兰溪市',
            value: '330781',
            children: null,
          },
          {
            label: '义乌市',
            value: '330782',
            children: null,
          },
          {
            label: '东阳市',
            value: '330783',
            children: null,
          },
          {
            label: '永康市',
            value: '330784',
            children: null,
          },
        ],
      },
      {
        label: '衢州市',
        value: '330800',
        children: [
          {
            label: '柯城区',
            value: '330802',
            children: null,
          },
          {
            label: '衢江区',
            value: '330803',
            children: null,
          },
          {
            label: '常山县',
            value: '330822',
            children: null,
          },
          {
            label: '开化县',
            value: '330824',
            children: null,
          },
          {
            label: '龙游县',
            value: '330825',
            children: null,
          },
          {
            label: '江山市',
            value: '330881',
            children: null,
          },
        ],
      },
      {
        label: '舟山市',
        value: '330900',
        children: [
          {
            label: '定海区',
            value: '330902',
            children: null,
          },
          {
            label: '普陀区',
            value: '330903',
            children: null,
          },
          {
            label: '岱山县',
            value: '330921',
            children: null,
          },
          {
            label: '嵊泗县',
            value: '330922',
            children: null,
          },
        ],
      },
      {
        label: '台州市',
        value: '331000',
        children: [
          {
            label: '椒江区',
            value: '331002',
            children: null,
          },
          {
            label: '黄岩区',
            value: '331003',
            children: null,
          },
          {
            label: '路桥区',
            value: '331004',
            children: null,
          },
          {
            label: '三门县',
            value: '331022',
            children: null,
          },
          {
            label: '天台县',
            value: '331023',
            children: null,
          },
          {
            label: '仙居县',
            value: '331024',
            children: null,
          },
          {
            label: '温岭市',
            value: '331081',
            children: null,
          },
          {
            label: '临海市',
            value: '331082',
            children: null,
          },
          {
            label: '玉环市',
            value: '331083',
            children: null,
          },
        ],
      },
      {
        label: '丽水市',
        value: '331100',
        children: [
          {
            label: '莲都区',
            value: '331102',
            children: null,
          },
          {
            label: '青田县',
            value: '331121',
            children: null,
          },
          {
            label: '缙云县',
            value: '331122',
            children: null,
          },
          {
            label: '遂昌县',
            value: '331123',
            children: null,
          },
          {
            label: '松阳县',
            value: '331124',
            children: null,
          },
          {
            label: '云和县',
            value: '331125',
            children: null,
          },
          {
            label: '庆元县',
            value: '331126',
            children: null,
          },
          {
            label: '景宁畲族自治县',
            value: '331127',
            children: null,
          },
          {
            label: '龙泉市',
            value: '331181',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '安徽省',
    value: '340000',
    children: [
      {
        label: '合肥市',
        value: '340100',
        children: [
          {
            label: '瑶海区',
            value: '340102',
            children: null,
          },
          {
            label: '庐阳区',
            value: '340103',
            children: null,
          },
          {
            label: '蜀山区',
            value: '340104',
            children: null,
          },
          {
            label: '包河区',
            value: '340111',
            children: null,
          },
          {
            label: '长丰县',
            value: '340121',
            children: null,
          },
          {
            label: '肥东县',
            value: '340122',
            children: null,
          },
          {
            label: '肥西县',
            value: '340123',
            children: null,
          },
          {
            label: '庐江县',
            value: '340124',
            children: null,
          },
          {
            label: '巢湖市',
            value: '340181',
            children: null,
          },
        ],
      },
      {
        label: '芜湖市',
        value: '340200',
        children: [
          {
            label: '镜湖区',
            value: '340202',
            children: null,
          },
          {
            label: '弋江区',
            value: '340203',
            children: null,
          },
          {
            label: '鸠江区',
            value: '340207',
            children: null,
          },
          {
            label: '三山区',
            value: '340208',
            children: null,
          },
          {
            label: '芜湖县',
            value: '340221',
            children: null,
          },
          {
            label: '繁昌县',
            value: '340222',
            children: null,
          },
          {
            label: '南陵县',
            value: '340223',
            children: null,
          },
          {
            label: '无为县',
            value: '340225',
            children: null,
          },
        ],
      },
      {
        label: '蚌埠市',
        value: '340300',
        children: [
          {
            label: '龙子湖区',
            value: '340302',
            children: null,
          },
          {
            label: '蚌山区',
            value: '340303',
            children: null,
          },
          {
            label: '禹会区',
            value: '340304',
            children: null,
          },
          {
            label: '淮上区',
            value: '340311',
            children: null,
          },
          {
            label: '怀远县',
            value: '340321',
            children: null,
          },
          {
            label: '五河县',
            value: '340322',
            children: null,
          },
          {
            label: '固镇县',
            value: '340323',
            children: null,
          },
        ],
      },
      {
        label: '淮南市',
        value: '340400',
        children: [
          {
            label: '大通区',
            value: '340402',
            children: null,
          },
          {
            label: '田家庵区',
            value: '340403',
            children: null,
          },
          {
            label: '谢家集区',
            value: '340404',
            children: null,
          },
          {
            label: '八公山区',
            value: '340405',
            children: null,
          },
          {
            label: '潘集区',
            value: '340406',
            children: null,
          },
          {
            label: '凤台县',
            value: '340421',
            children: null,
          },
          {
            label: '寿县',
            value: '340422',
            children: null,
          },
        ],
      },
      {
        label: '马鞍山市',
        value: '340500',
        children: [
          {
            label: '花山区',
            value: '340503',
            children: null,
          },
          {
            label: '雨山区',
            value: '340504',
            children: null,
          },
          {
            label: '博望区',
            value: '340506',
            children: null,
          },
          {
            label: '当涂县',
            value: '340521',
            children: null,
          },
          {
            label: '含山县',
            value: '340522',
            children: null,
          },
          {
            label: '和县',
            value: '340523',
            children: null,
          },
        ],
      },
      {
        label: '淮北市',
        value: '340600',
        children: [
          {
            label: '杜集区',
            value: '340602',
            children: null,
          },
          {
            label: '相山区',
            value: '340603',
            children: null,
          },
          {
            label: '烈山区',
            value: '340604',
            children: null,
          },
          {
            label: '濉溪县',
            value: '340621',
            children: null,
          },
        ],
      },
      {
        label: '铜陵市',
        value: '340700',
        children: [
          {
            label: '铜官区',
            value: '340705',
            children: null,
          },
          {
            label: '义安区',
            value: '340706',
            children: null,
          },
          {
            label: '郊区',
            value: '340711',
            children: null,
          },
          {
            label: '枞阳县',
            value: '340722',
            children: null,
          },
        ],
      },
      {
        label: '安庆市',
        value: '340800',
        children: [
          {
            label: '迎江区',
            value: '340802',
            children: null,
          },
          {
            label: '大观区',
            value: '340803',
            children: null,
          },
          {
            label: '宜秀区',
            value: '340811',
            children: null,
          },
          {
            label: '怀宁县',
            value: '340822',
            children: null,
          },
          {
            label: '太湖县',
            value: '340825',
            children: null,
          },
          {
            label: '宿松县',
            value: '340826',
            children: null,
          },
          {
            label: '望江县',
            value: '340827',
            children: null,
          },
          {
            label: '岳西县',
            value: '340828',
            children: null,
          },
          {
            label: '桐城市',
            value: '340881',
            children: null,
          },
          {
            label: '潜山市',
            value: '340882',
            children: null,
          },
        ],
      },
      {
        label: '黄山市',
        value: '341000',
        children: [
          {
            label: '屯溪区',
            value: '341002',
            children: null,
          },
          {
            label: '黄山区',
            value: '341003',
            children: null,
          },
          {
            label: '徽州区',
            value: '341004',
            children: null,
          },
          {
            label: '歙县',
            value: '341021',
            children: null,
          },
          {
            label: '休宁县',
            value: '341022',
            children: null,
          },
          {
            label: '黟县',
            value: '341023',
            children: null,
          },
          {
            label: '祁门县',
            value: '341024',
            children: null,
          },
        ],
      },
      {
        label: '滁州市',
        value: '341100',
        children: [
          {
            label: '琅琊区',
            value: '341102',
            children: null,
          },
          {
            label: '南谯区',
            value: '341103',
            children: null,
          },
          {
            label: '来安县',
            value: '341122',
            children: null,
          },
          {
            label: '全椒县',
            value: '341124',
            children: null,
          },
          {
            label: '定远县',
            value: '341125',
            children: null,
          },
          {
            label: '凤阳县',
            value: '341126',
            children: null,
          },
          {
            label: '天长市',
            value: '341181',
            children: null,
          },
          {
            label: '明光市',
            value: '341182',
            children: null,
          },
        ],
      },
      {
        label: '阜阳市',
        value: '341200',
        children: [
          {
            label: '颍州区',
            value: '341202',
            children: null,
          },
          {
            label: '颍东区',
            value: '341203',
            children: null,
          },
          {
            label: '颍泉区',
            value: '341204',
            children: null,
          },
          {
            label: '临泉县',
            value: '341221',
            children: null,
          },
          {
            label: '太和县',
            value: '341222',
            children: null,
          },
          {
            label: '阜南县',
            value: '341225',
            children: null,
          },
          {
            label: '颍上县',
            value: '341226',
            children: null,
          },
          {
            label: '界首市',
            value: '341282',
            children: null,
          },
        ],
      },
      {
        label: '宿州市',
        value: '341300',
        children: [
          {
            label: '埇桥区',
            value: '341302',
            children: null,
          },
          {
            label: '砀山县',
            value: '341321',
            children: null,
          },
          {
            label: '萧县',
            value: '341322',
            children: null,
          },
          {
            label: '灵璧县',
            value: '341323',
            children: null,
          },
          {
            label: '泗县',
            value: '341324',
            children: null,
          },
        ],
      },
      {
        label: '六安市',
        value: '341500',
        children: [
          {
            label: '金安区',
            value: '341502',
            children: null,
          },
          {
            label: '裕安区',
            value: '341503',
            children: null,
          },
          {
            label: '叶集区',
            value: '341504',
            children: null,
          },
          {
            label: '霍邱县',
            value: '341522',
            children: null,
          },
          {
            label: '舒城县',
            value: '341523',
            children: null,
          },
          {
            label: '金寨县',
            value: '341524',
            children: null,
          },
          {
            label: '霍山县',
            value: '341525',
            children: null,
          },
        ],
      },
      {
        label: '亳州市',
        value: '341600',
        children: [
          {
            label: '谯城区',
            value: '341602',
            children: null,
          },
          {
            label: '涡阳县',
            value: '341621',
            children: null,
          },
          {
            label: '蒙城县',
            value: '341622',
            children: null,
          },
          {
            label: '利辛县',
            value: '341623',
            children: null,
          },
        ],
      },
      {
        label: '池州市',
        value: '341700',
        children: [
          {
            label: '贵池区',
            value: '341702',
            children: null,
          },
          {
            label: '东至县',
            value: '341721',
            children: null,
          },
          {
            label: '石台县',
            value: '341722',
            children: null,
          },
          {
            label: '青阳县',
            value: '341723',
            children: null,
          },
        ],
      },
      {
        label: '宣城市',
        value: '341800',
        children: [
          {
            label: '宣州区',
            value: '341802',
            children: null,
          },
          {
            label: '郎溪县',
            value: '341821',
            children: null,
          },
          {
            label: '广德县',
            value: '341822',
            children: null,
          },
          {
            label: '泾县',
            value: '341823',
            children: null,
          },
          {
            label: '绩溪县',
            value: '341824',
            children: null,
          },
          {
            label: '旌德县',
            value: '341825',
            children: null,
          },
          {
            label: '宁国市',
            value: '341881',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '福建省',
    value: '350000',
    children: [
      {
        label: '福州市',
        value: '350100',
        children: [
          {
            label: '鼓楼区',
            value: '350102',
            children: null,
          },
          {
            label: '台江区',
            value: '350103',
            children: null,
          },
          {
            label: '仓山区',
            value: '350104',
            children: null,
          },
          {
            label: '马尾区',
            value: '350105',
            children: null,
          },
          {
            label: '晋安区',
            value: '350111',
            children: null,
          },
          {
            label: '长乐区',
            value: '350112',
            children: null,
          },
          {
            label: '闽侯县',
            value: '350121',
            children: null,
          },
          {
            label: '连江县',
            value: '350122',
            children: null,
          },
          {
            label: '罗源县',
            value: '350123',
            children: null,
          },
          {
            label: '闽清县',
            value: '350124',
            children: null,
          },
          {
            label: '永泰县',
            value: '350125',
            children: null,
          },
          {
            label: '平潭县',
            value: '350128',
            children: null,
          },
          {
            label: '福清市',
            value: '350181',
            children: null,
          },
        ],
      },
      {
        label: '厦门市',
        value: '350200',
        children: [
          {
            label: '思明区',
            value: '350203',
            children: null,
          },
          {
            label: '海沧区',
            value: '350205',
            children: null,
          },
          {
            label: '湖里区',
            value: '350206',
            children: null,
          },
          {
            label: '集美区',
            value: '350211',
            children: null,
          },
          {
            label: '同安区',
            value: '350212',
            children: null,
          },
          {
            label: '翔安区',
            value: '350213',
            children: null,
          },
        ],
      },
      {
        label: '莆田市',
        value: '350300',
        children: [
          {
            label: '城厢区',
            value: '350302',
            children: null,
          },
          {
            label: '涵江区',
            value: '350303',
            children: null,
          },
          {
            label: '荔城区',
            value: '350304',
            children: null,
          },
          {
            label: '秀屿区',
            value: '350305',
            children: null,
          },
          {
            label: '仙游县',
            value: '350322',
            children: null,
          },
        ],
      },
      {
        label: '三明市',
        value: '350400',
        children: [
          {
            label: '梅列区',
            value: '350402',
            children: null,
          },
          {
            label: '三元区',
            value: '350403',
            children: null,
          },
          {
            label: '明溪县',
            value: '350421',
            children: null,
          },
          {
            label: '清流县',
            value: '350423',
            children: null,
          },
          {
            label: '宁化县',
            value: '350424',
            children: null,
          },
          {
            label: '大田县',
            value: '350425',
            children: null,
          },
          {
            label: '尤溪县',
            value: '350426',
            children: null,
          },
          {
            label: '沙县',
            value: '350427',
            children: null,
          },
          {
            label: '将乐县',
            value: '350428',
            children: null,
          },
          {
            label: '泰宁县',
            value: '350429',
            children: null,
          },
          {
            label: '建宁县',
            value: '350430',
            children: null,
          },
          {
            label: '永安市',
            value: '350481',
            children: null,
          },
        ],
      },
      {
        label: '泉州市',
        value: '350500',
        children: [
          {
            label: '鲤城区',
            value: '350502',
            children: null,
          },
          {
            label: '丰泽区',
            value: '350503',
            children: null,
          },
          {
            label: '洛江区',
            value: '350504',
            children: null,
          },
          {
            label: '泉港区',
            value: '350505',
            children: null,
          },
          {
            label: '惠安县',
            value: '350521',
            children: null,
          },
          {
            label: '安溪县',
            value: '350524',
            children: null,
          },
          {
            label: '永春县',
            value: '350525',
            children: null,
          },
          {
            label: '德化县',
            value: '350526',
            children: null,
          },
          {
            label: '金门县',
            value: '350527',
            children: null,
          },
          {
            label: '石狮市',
            value: '350581',
            children: null,
          },
          {
            label: '晋江市',
            value: '350582',
            children: null,
          },
          {
            label: '南安市',
            value: '350583',
            children: null,
          },
        ],
      },
      {
        label: '漳州市',
        value: '350600',
        children: [
          {
            label: '芗城区',
            value: '350602',
            children: null,
          },
          {
            label: '龙文区',
            value: '350603',
            children: null,
          },
          {
            label: '云霄县',
            value: '350622',
            children: null,
          },
          {
            label: '漳浦县',
            value: '350623',
            children: null,
          },
          {
            label: '诏安县',
            value: '350624',
            children: null,
          },
          {
            label: '长泰县',
            value: '350625',
            children: null,
          },
          {
            label: '东山县',
            value: '350626',
            children: null,
          },
          {
            label: '南靖县',
            value: '350627',
            children: null,
          },
          {
            label: '平和县',
            value: '350628',
            children: null,
          },
          {
            label: '华安县',
            value: '350629',
            children: null,
          },
          {
            label: '龙海市',
            value: '350681',
            children: null,
          },
        ],
      },
      {
        label: '南平市',
        value: '350700',
        children: [
          {
            label: '延平区',
            value: '350702',
            children: null,
          },
          {
            label: '建阳区',
            value: '350703',
            children: null,
          },
          {
            label: '顺昌县',
            value: '350721',
            children: null,
          },
          {
            label: '浦城县',
            value: '350722',
            children: null,
          },
          {
            label: '光泽县',
            value: '350723',
            children: null,
          },
          {
            label: '松溪县',
            value: '350724',
            children: null,
          },
          {
            label: '政和县',
            value: '350725',
            children: null,
          },
          {
            label: '邵武市',
            value: '350781',
            children: null,
          },
          {
            label: '武夷山市',
            value: '350782',
            children: null,
          },
          {
            label: '建瓯市',
            value: '350783',
            children: null,
          },
        ],
      },
      {
        label: '龙岩市',
        value: '350800',
        children: [
          {
            label: '新罗区',
            value: '350802',
            children: null,
          },
          {
            label: '永定区',
            value: '350803',
            children: null,
          },
          {
            label: '长汀县',
            value: '350821',
            children: null,
          },
          {
            label: '上杭县',
            value: '350823',
            children: null,
          },
          {
            label: '武平县',
            value: '350824',
            children: null,
          },
          {
            label: '连城县',
            value: '350825',
            children: null,
          },
          {
            label: '漳平市',
            value: '350881',
            children: null,
          },
        ],
      },
      {
        label: '宁德市',
        value: '350900',
        children: [
          {
            label: '蕉城区',
            value: '350902',
            children: null,
          },
          {
            label: '霞浦县',
            value: '350921',
            children: null,
          },
          {
            label: '古田县',
            value: '350922',
            children: null,
          },
          {
            label: '屏南县',
            value: '350923',
            children: null,
          },
          {
            label: '寿宁县',
            value: '350924',
            children: null,
          },
          {
            label: '周宁县',
            value: '350925',
            children: null,
          },
          {
            label: '柘荣县',
            value: '350926',
            children: null,
          },
          {
            label: '福安市',
            value: '350981',
            children: null,
          },
          {
            label: '福鼎市',
            value: '350982',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '江西省',
    value: '360000',
    children: [
      {
        label: '南昌市',
        value: '360100',
        children: [
          {
            label: '东湖区',
            value: '360102',
            children: null,
          },
          {
            label: '西湖区',
            value: '360103',
            children: null,
          },
          {
            label: '青云谱区',
            value: '360104',
            children: null,
          },
          {
            label: '湾里区',
            value: '360105',
            children: null,
          },
          {
            label: '青山湖区',
            value: '360111',
            children: null,
          },
          {
            label: '新建区',
            value: '360112',
            children: null,
          },
          {
            label: '南昌县',
            value: '360121',
            children: null,
          },
          {
            label: '安义县',
            value: '360123',
            children: null,
          },
          {
            label: '进贤县',
            value: '360124',
            children: null,
          },
        ],
      },
      {
        label: '景德镇市',
        value: '360200',
        children: [
          {
            label: '昌江区',
            value: '360202',
            children: null,
          },
          {
            label: '珠山区',
            value: '360203',
            children: null,
          },
          {
            label: '浮梁县',
            value: '360222',
            children: null,
          },
          {
            label: '乐平市',
            value: '360281',
            children: null,
          },
        ],
      },
      {
        label: '萍乡市',
        value: '360300',
        children: [
          {
            label: '安源区',
            value: '360302',
            children: null,
          },
          {
            label: '湘东区',
            value: '360313',
            children: null,
          },
          {
            label: '莲花县',
            value: '360321',
            children: null,
          },
          {
            label: '上栗县',
            value: '360322',
            children: null,
          },
          {
            label: '芦溪县',
            value: '360323',
            children: null,
          },
        ],
      },
      {
        label: '九江市',
        value: '360400',
        children: [
          {
            label: '濂溪区',
            value: '360402',
            children: null,
          },
          {
            label: '浔阳区',
            value: '360403',
            children: null,
          },
          {
            label: '柴桑区',
            value: '360404',
            children: null,
          },
          {
            label: '武宁县',
            value: '360423',
            children: null,
          },
          {
            label: '修水县',
            value: '360424',
            children: null,
          },
          {
            label: '永修县',
            value: '360425',
            children: null,
          },
          {
            label: '德安县',
            value: '360426',
            children: null,
          },
          {
            label: '都昌县',
            value: '360428',
            children: null,
          },
          {
            label: '湖口县',
            value: '360429',
            children: null,
          },
          {
            label: '彭泽县',
            value: '360430',
            children: null,
          },
          {
            label: '瑞昌市',
            value: '360481',
            children: null,
          },
          {
            label: '共青城市',
            value: '360482',
            children: null,
          },
          {
            label: '庐山市',
            value: '360483',
            children: null,
          },
        ],
      },
      {
        label: '新余市',
        value: '360500',
        children: [
          {
            label: '渝水区',
            value: '360502',
            children: null,
          },
          {
            label: '分宜县',
            value: '360521',
            children: null,
          },
        ],
      },
      {
        label: '鹰潭市',
        value: '360600',
        children: [
          {
            label: '月湖区',
            value: '360602',
            children: null,
          },
          {
            label: '余江区',
            value: '360603',
            children: null,
          },
          {
            label: '贵溪市',
            value: '360681',
            children: null,
          },
        ],
      },
      {
        label: '赣州市',
        value: '360700',
        children: [
          {
            label: '章贡区',
            value: '360702',
            children: null,
          },
          {
            label: '南康区',
            value: '360703',
            children: null,
          },
          {
            label: '赣县区',
            value: '360704',
            children: null,
          },
          {
            label: '信丰县',
            value: '360722',
            children: null,
          },
          {
            label: '大余县',
            value: '360723',
            children: null,
          },
          {
            label: '上犹县',
            value: '360724',
            children: null,
          },
          {
            label: '崇义县',
            value: '360725',
            children: null,
          },
          {
            label: '安远县',
            value: '360726',
            children: null,
          },
          {
            label: '龙南县',
            value: '360727',
            children: null,
          },
          {
            label: '定南县',
            value: '360728',
            children: null,
          },
          {
            label: '全南县',
            value: '360729',
            children: null,
          },
          {
            label: '宁都县',
            value: '360730',
            children: null,
          },
          {
            label: '于都县',
            value: '360731',
            children: null,
          },
          {
            label: '兴国县',
            value: '360732',
            children: null,
          },
          {
            label: '会昌县',
            value: '360733',
            children: null,
          },
          {
            label: '寻乌县',
            value: '360734',
            children: null,
          },
          {
            label: '石城县',
            value: '360735',
            children: null,
          },
          {
            label: '瑞金市',
            value: '360781',
            children: null,
          },
        ],
      },
      {
        label: '吉安市',
        value: '360800',
        children: [
          {
            label: '吉州区',
            value: '360802',
            children: null,
          },
          {
            label: '青原区',
            value: '360803',
            children: null,
          },
          {
            label: '吉安县',
            value: '360821',
            children: null,
          },
          {
            label: '吉水县',
            value: '360822',
            children: null,
          },
          {
            label: '峡江县',
            value: '360823',
            children: null,
          },
          {
            label: '新干县',
            value: '360824',
            children: null,
          },
          {
            label: '永丰县',
            value: '360825',
            children: null,
          },
          {
            label: '泰和县',
            value: '360826',
            children: null,
          },
          {
            label: '遂川县',
            value: '360827',
            children: null,
          },
          {
            label: '万安县',
            value: '360828',
            children: null,
          },
          {
            label: '安福县',
            value: '360829',
            children: null,
          },
          {
            label: '永新县',
            value: '360830',
            children: null,
          },
          {
            label: '井冈山市',
            value: '360881',
            children: null,
          },
        ],
      },
      {
        label: '宜春市',
        value: '360900',
        children: [
          {
            label: '袁州区',
            value: '360902',
            children: null,
          },
          {
            label: '奉新县',
            value: '360921',
            children: null,
          },
          {
            label: '万载县',
            value: '360922',
            children: null,
          },
          {
            label: '上高县',
            value: '360923',
            children: null,
          },
          {
            label: '宜丰县',
            value: '360924',
            children: null,
          },
          {
            label: '靖安县',
            value: '360925',
            children: null,
          },
          {
            label: '铜鼓县',
            value: '360926',
            children: null,
          },
          {
            label: '丰城市',
            value: '360981',
            children: null,
          },
          {
            label: '樟树市',
            value: '360982',
            children: null,
          },
          {
            label: '高安市',
            value: '360983',
            children: null,
          },
        ],
      },
      {
        label: '抚州市',
        value: '361000',
        children: [
          {
            label: '临川区',
            value: '361002',
            children: null,
          },
          {
            label: '东乡区',
            value: '361003',
            children: null,
          },
          {
            label: '南城县',
            value: '361021',
            children: null,
          },
          {
            label: '黎川县',
            value: '361022',
            children: null,
          },
          {
            label: '南丰县',
            value: '361023',
            children: null,
          },
          {
            label: '崇仁县',
            value: '361024',
            children: null,
          },
          {
            label: '乐安县',
            value: '361025',
            children: null,
          },
          {
            label: '宜黄县',
            value: '361026',
            children: null,
          },
          {
            label: '金溪县',
            value: '361027',
            children: null,
          },
          {
            label: '资溪县',
            value: '361028',
            children: null,
          },
          {
            label: '广昌县',
            value: '361030',
            children: null,
          },
        ],
      },
      {
        label: '上饶市',
        value: '361100',
        children: [
          {
            label: '信州区',
            value: '361102',
            children: null,
          },
          {
            label: '广丰区',
            value: '361103',
            children: null,
          },
          {
            label: '上饶县',
            value: '361121',
            children: null,
          },
          {
            label: '玉山县',
            value: '361123',
            children: null,
          },
          {
            label: '铅山县',
            value: '361124',
            children: null,
          },
          {
            label: '横峰县',
            value: '361125',
            children: null,
          },
          {
            label: '弋阳县',
            value: '361126',
            children: null,
          },
          {
            label: '余干县',
            value: '361127',
            children: null,
          },
          {
            label: '鄱阳县',
            value: '361128',
            children: null,
          },
          {
            label: '万年县',
            value: '361129',
            children: null,
          },
          {
            label: '婺源县',
            value: '361130',
            children: null,
          },
          {
            label: '德兴市',
            value: '361181',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '山东省',
    value: '370000',
    children: [
      {
        label: '济南市',
        value: '370100',
        children: [
          {
            label: '历下区',
            value: '370102',
            children: null,
          },
          {
            label: '市中区',
            value: '370103',
            children: null,
          },
          {
            label: '槐荫区',
            value: '370104',
            children: null,
          },
          {
            label: '天桥区',
            value: '370105',
            children: null,
          },
          {
            label: '历城区',
            value: '370112',
            children: null,
          },
          {
            label: '长清区',
            value: '370113',
            children: null,
          },
          {
            label: '章丘区',
            value: '370114',
            children: null,
          },
          {
            label: '济阳区',
            value: '370115',
            children: null,
          },
          {
            label: '莱芜区',
            value: '370116',
            children: null,
          },
          {
            label: '钢城区',
            value: '370117',
            children: null,
          },
          {
            label: '平阴县',
            value: '370124',
            children: null,
          },
          {
            label: '商河县',
            value: '370126',
            children: null,
          },
        ],
      },
      {
        label: '青岛市',
        value: '370200',
        children: [
          {
            label: '市南区',
            value: '370202',
            children: null,
          },
          {
            label: '市北区',
            value: '370203',
            children: null,
          },
          {
            label: '黄岛区',
            value: '370211',
            children: null,
          },
          {
            label: '崂山区',
            value: '370212',
            children: null,
          },
          {
            label: '李沧区',
            value: '370213',
            children: null,
          },
          {
            label: '城阳区',
            value: '370214',
            children: null,
          },
          {
            label: '即墨区',
            value: '370215',
            children: null,
          },
          {
            label: '胶州市',
            value: '370281',
            children: null,
          },
          {
            label: '平度市',
            value: '370283',
            children: null,
          },
          {
            label: '莱西市',
            value: '370285',
            children: null,
          },
        ],
      },
      {
        label: '淄博市',
        value: '370300',
        children: [
          {
            label: '淄川区',
            value: '370302',
            children: null,
          },
          {
            label: '张店区',
            value: '370303',
            children: null,
          },
          {
            label: '博山区',
            value: '370304',
            children: null,
          },
          {
            label: '临淄区',
            value: '370305',
            children: null,
          },
          {
            label: '周村区',
            value: '370306',
            children: null,
          },
          {
            label: '桓台县',
            value: '370321',
            children: null,
          },
          {
            label: '高青县',
            value: '370322',
            children: null,
          },
          {
            label: '沂源县',
            value: '370323',
            children: null,
          },
        ],
      },
      {
        label: '枣庄市',
        value: '370400',
        children: [
          {
            label: '市中区',
            value: '370402',
            children: null,
          },
          {
            label: '薛城区',
            value: '370403',
            children: null,
          },
          {
            label: '峄城区',
            value: '370404',
            children: null,
          },
          {
            label: '台儿庄区',
            value: '370405',
            children: null,
          },
          {
            label: '山亭区',
            value: '370406',
            children: null,
          },
          {
            label: '滕州市',
            value: '370481',
            children: null,
          },
        ],
      },
      {
        label: '东营市',
        value: '370500',
        children: [
          {
            label: '东营区',
            value: '370502',
            children: null,
          },
          {
            label: '河口区',
            value: '370503',
            children: null,
          },
          {
            label: '垦利区',
            value: '370505',
            children: null,
          },
          {
            label: '利津县',
            value: '370522',
            children: null,
          },
          {
            label: '广饶县',
            value: '370523',
            children: null,
          },
        ],
      },
      {
        label: '烟台市',
        value: '370600',
        children: [
          {
            label: '芝罘区',
            value: '370602',
            children: null,
          },
          {
            label: '福山区',
            value: '370611',
            children: null,
          },
          {
            label: '牟平区',
            value: '370612',
            children: null,
          },
          {
            label: '莱山区',
            value: '370613',
            children: null,
          },
          {
            label: '长岛县',
            value: '370634',
            children: null,
          },
          {
            label: '龙口市',
            value: '370681',
            children: null,
          },
          {
            label: '莱阳市',
            value: '370682',
            children: null,
          },
          {
            label: '莱州市',
            value: '370683',
            children: null,
          },
          {
            label: '蓬莱市',
            value: '370684',
            children: null,
          },
          {
            label: '招远市',
            value: '370685',
            children: null,
          },
          {
            label: '栖霞市',
            value: '370686',
            children: null,
          },
          {
            label: '海阳市',
            value: '370687',
            children: null,
          },
        ],
      },
      {
        label: '潍坊市',
        value: '370700',
        children: [
          {
            label: '潍城区',
            value: '370702',
            children: null,
          },
          {
            label: '寒亭区',
            value: '370703',
            children: null,
          },
          {
            label: '坊子区',
            value: '370704',
            children: null,
          },
          {
            label: '奎文区',
            value: '370705',
            children: null,
          },
          {
            label: '临朐县',
            value: '370724',
            children: null,
          },
          {
            label: '昌乐县',
            value: '370725',
            children: null,
          },
          {
            label: '青州市',
            value: '370781',
            children: null,
          },
          {
            label: '诸城市',
            value: '370782',
            children: null,
          },
          {
            label: '寿光市',
            value: '370783',
            children: null,
          },
          {
            label: '安丘市',
            value: '370784',
            children: null,
          },
          {
            label: '高密市',
            value: '370785',
            children: null,
          },
          {
            label: '昌邑市',
            value: '370786',
            children: null,
          },
        ],
      },
      {
        label: '济宁市',
        value: '370800',
        children: [
          {
            label: '任城区',
            value: '370811',
            children: null,
          },
          {
            label: '兖州区',
            value: '370812',
            children: null,
          },
          {
            label: '微山县',
            value: '370826',
            children: null,
          },
          {
            label: '鱼台县',
            value: '370827',
            children: null,
          },
          {
            label: '金乡县',
            value: '370828',
            children: null,
          },
          {
            label: '嘉祥县',
            value: '370829',
            children: null,
          },
          {
            label: '汶上县',
            value: '370830',
            children: null,
          },
          {
            label: '泗水县',
            value: '370831',
            children: null,
          },
          {
            label: '梁山县',
            value: '370832',
            children: null,
          },
          {
            label: '曲阜市',
            value: '370881',
            children: null,
          },
          {
            label: '邹城市',
            value: '370883',
            children: null,
          },
        ],
      },
      {
        label: '泰安市',
        value: '370900',
        children: [
          {
            label: '泰山区',
            value: '370902',
            children: null,
          },
          {
            label: '岱岳区',
            value: '370911',
            children: null,
          },
          {
            label: '宁阳县',
            value: '370921',
            children: null,
          },
          {
            label: '东平县',
            value: '370923',
            children: null,
          },
          {
            label: '新泰市',
            value: '370982',
            children: null,
          },
          {
            label: '肥城市',
            value: '370983',
            children: null,
          },
        ],
      },
      {
        label: '威海市',
        value: '371000',
        children: [
          {
            label: '环翠区',
            value: '371002',
            children: null,
          },
          {
            label: '文登区',
            value: '371003',
            children: null,
          },
          {
            label: '荣成市',
            value: '371082',
            children: null,
          },
          {
            label: '乳山市',
            value: '371083',
            children: null,
          },
        ],
      },
      {
        label: '日照市',
        value: '371100',
        children: [
          {
            label: '东港区',
            value: '371102',
            children: null,
          },
          {
            label: '岚山区',
            value: '371103',
            children: null,
          },
          {
            label: '五莲县',
            value: '371121',
            children: null,
          },
          {
            label: '莒县',
            value: '371122',
            children: null,
          },
        ],
      },
      {
        label: '临沂市',
        value: '371300',
        children: [
          {
            label: '兰山区',
            value: '371302',
            children: null,
          },
          {
            label: '罗庄区',
            value: '371311',
            children: null,
          },
          {
            label: '河东区',
            value: '371312',
            children: null,
          },
          {
            label: '沂南县',
            value: '371321',
            children: null,
          },
          {
            label: '郯城县',
            value: '371322',
            children: null,
          },
          {
            label: '沂水县',
            value: '371323',
            children: null,
          },
          {
            label: '兰陵县',
            value: '371324',
            children: null,
          },
          {
            label: '费县',
            value: '371325',
            children: null,
          },
          {
            label: '平邑县',
            value: '371326',
            children: null,
          },
          {
            label: '莒南县',
            value: '371327',
            children: null,
          },
          {
            label: '蒙阴县',
            value: '371328',
            children: null,
          },
          {
            label: '临沭县',
            value: '371329',
            children: null,
          },
        ],
      },
      {
        label: '德州市',
        value: '371400',
        children: [
          {
            label: '德城区',
            value: '371402',
            children: null,
          },
          {
            label: '陵城区',
            value: '371403',
            children: null,
          },
          {
            label: '宁津县',
            value: '371422',
            children: null,
          },
          {
            label: '庆云县',
            value: '371423',
            children: null,
          },
          {
            label: '临邑县',
            value: '371424',
            children: null,
          },
          {
            label: '齐河县',
            value: '371425',
            children: null,
          },
          {
            label: '平原县',
            value: '371426',
            children: null,
          },
          {
            label: '夏津县',
            value: '371427',
            children: null,
          },
          {
            label: '武城县',
            value: '371428',
            children: null,
          },
          {
            label: '乐陵市',
            value: '371481',
            children: null,
          },
          {
            label: '禹城市',
            value: '371482',
            children: null,
          },
        ],
      },
      {
        label: '聊城市',
        value: '371500',
        children: [
          {
            label: '东昌府区',
            value: '371502',
            children: null,
          },
          {
            label: '阳谷县',
            value: '371521',
            children: null,
          },
          {
            label: '莘县',
            value: '371522',
            children: null,
          },
          {
            label: '茌平县',
            value: '371523',
            children: null,
          },
          {
            label: '东阿县',
            value: '371524',
            children: null,
          },
          {
            label: '冠县',
            value: '371525',
            children: null,
          },
          {
            label: '高唐县',
            value: '371526',
            children: null,
          },
          {
            label: '临清市',
            value: '371581',
            children: null,
          },
        ],
      },
      {
        label: '滨州市',
        value: '371600',
        children: [
          {
            label: '滨城区',
            value: '371602',
            children: null,
          },
          {
            label: '沾化区',
            value: '371603',
            children: null,
          },
          {
            label: '惠民县',
            value: '371621',
            children: null,
          },
          {
            label: '阳信县',
            value: '371622',
            children: null,
          },
          {
            label: '无棣县',
            value: '371623',
            children: null,
          },
          {
            label: '博兴县',
            value: '371625',
            children: null,
          },
          {
            label: '邹平市',
            value: '371681',
            children: null,
          },
        ],
      },
      {
        label: '菏泽市',
        value: '371700',
        children: [
          {
            label: '牡丹区',
            value: '371702',
            children: null,
          },
          {
            label: '定陶区',
            value: '371703',
            children: null,
          },
          {
            label: '曹县',
            value: '371721',
            children: null,
          },
          {
            label: '单县',
            value: '371722',
            children: null,
          },
          {
            label: '成武县',
            value: '371723',
            children: null,
          },
          {
            label: '巨野县',
            value: '371724',
            children: null,
          },
          {
            label: '郓城县',
            value: '371725',
            children: null,
          },
          {
            label: '鄄城县',
            value: '371726',
            children: null,
          },
          {
            label: '东明县',
            value: '371728',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '河南省',
    value: '410000',
    children: [
      {
        label: '郑州市',
        value: '410100',
        children: [
          {
            label: '中原区',
            value: '410102',
            children: null,
          },
          {
            label: '二七区',
            value: '410103',
            children: null,
          },
          {
            label: '管城回族区',
            value: '410104',
            children: null,
          },
          {
            label: '金水区',
            value: '410105',
            children: null,
          },
          {
            label: '上街区',
            value: '410106',
            children: null,
          },
          {
            label: '惠济区',
            value: '410108',
            children: null,
          },
          {
            label: '中牟县',
            value: '410122',
            children: null,
          },
          {
            label: '巩义市',
            value: '410181',
            children: null,
          },
          {
            label: '荥阳市',
            value: '410182',
            children: null,
          },
          {
            label: '新密市',
            value: '410183',
            children: null,
          },
          {
            label: '新郑市',
            value: '410184',
            children: null,
          },
          {
            label: '登封市',
            value: '410185',
            children: null,
          },
        ],
      },
      {
        label: '开封市',
        value: '410200',
        children: [
          {
            label: '龙亭区',
            value: '410202',
            children: null,
          },
          {
            label: '顺河回族区',
            value: '410203',
            children: null,
          },
          {
            label: '鼓楼区',
            value: '410204',
            children: null,
          },
          {
            label: '禹王台区',
            value: '410205',
            children: null,
          },
          {
            label: '祥符区',
            value: '410212',
            children: null,
          },
          {
            label: '杞县',
            value: '410221',
            children: null,
          },
          {
            label: '通许县',
            value: '410222',
            children: null,
          },
          {
            label: '尉氏县',
            value: '410223',
            children: null,
          },
          {
            label: '兰考县',
            value: '410225',
            children: null,
          },
        ],
      },
      {
        label: '洛阳市',
        value: '410300',
        children: [
          {
            label: '老城区',
            value: '410302',
            children: null,
          },
          {
            label: '西工区',
            value: '410303',
            children: null,
          },
          {
            label: '瀍河回族区',
            value: '410304',
            children: null,
          },
          {
            label: '涧西区',
            value: '410305',
            children: null,
          },
          {
            label: '吉利区',
            value: '410306',
            children: null,
          },
          {
            label: '洛龙区',
            value: '410311',
            children: null,
          },
          {
            label: '孟津县',
            value: '410322',
            children: null,
          },
          {
            label: '新安县',
            value: '410323',
            children: null,
          },
          {
            label: '栾川县',
            value: '410324',
            children: null,
          },
          {
            label: '嵩县',
            value: '410325',
            children: null,
          },
          {
            label: '汝阳县',
            value: '410326',
            children: null,
          },
          {
            label: '宜阳县',
            value: '410327',
            children: null,
          },
          {
            label: '洛宁县',
            value: '410328',
            children: null,
          },
          {
            label: '伊川县',
            value: '410329',
            children: null,
          },
          {
            label: '偃师市',
            value: '410381',
            children: null,
          },
        ],
      },
      {
        label: '平顶山市',
        value: '410400',
        children: [
          {
            label: '新华区',
            value: '410402',
            children: null,
          },
          {
            label: '卫东区',
            value: '410403',
            children: null,
          },
          {
            label: '石龙区',
            value: '410404',
            children: null,
          },
          {
            label: '湛河区',
            value: '410411',
            children: null,
          },
          {
            label: '宝丰县',
            value: '410421',
            children: null,
          },
          {
            label: '叶县',
            value: '410422',
            children: null,
          },
          {
            label: '鲁山县',
            value: '410423',
            children: null,
          },
          {
            label: '郏县',
            value: '410425',
            children: null,
          },
          {
            label: '舞钢市',
            value: '410481',
            children: null,
          },
          {
            label: '汝州市',
            value: '410482',
            children: null,
          },
        ],
      },
      {
        label: '安阳市',
        value: '410500',
        children: [
          {
            label: '文峰区',
            value: '410502',
            children: null,
          },
          {
            label: '北关区',
            value: '410503',
            children: null,
          },
          {
            label: '殷都区',
            value: '410505',
            children: null,
          },
          {
            label: '龙安区',
            value: '410506',
            children: null,
          },
          {
            label: '安阳县',
            value: '410522',
            children: null,
          },
          {
            label: '汤阴县',
            value: '410523',
            children: null,
          },
          {
            label: '滑县',
            value: '410526',
            children: null,
          },
          {
            label: '内黄县',
            value: '410527',
            children: null,
          },
          {
            label: '林州市',
            value: '410581',
            children: null,
          },
        ],
      },
      {
        label: '鹤壁市',
        value: '410600',
        children: [
          {
            label: '鹤山区',
            value: '410602',
            children: null,
          },
          {
            label: '山城区',
            value: '410603',
            children: null,
          },
          {
            label: '淇滨区',
            value: '410611',
            children: null,
          },
          {
            label: '浚县',
            value: '410621',
            children: null,
          },
          {
            label: '淇县',
            value: '410622',
            children: null,
          },
        ],
      },
      {
        label: '新乡市',
        value: '410700',
        children: [
          {
            label: '红旗区',
            value: '410702',
            children: null,
          },
          {
            label: '卫滨区',
            value: '410703',
            children: null,
          },
          {
            label: '凤泉区',
            value: '410704',
            children: null,
          },
          {
            label: '牧野区',
            value: '410711',
            children: null,
          },
          {
            label: '新乡县',
            value: '410721',
            children: null,
          },
          {
            label: '获嘉县',
            value: '410724',
            children: null,
          },
          {
            label: '原阳县',
            value: '410725',
            children: null,
          },
          {
            label: '延津县',
            value: '410726',
            children: null,
          },
          {
            label: '封丘县',
            value: '410727',
            children: null,
          },
          {
            label: '长垣县',
            value: '410728',
            children: null,
          },
          {
            label: '卫辉市',
            value: '410781',
            children: null,
          },
          {
            label: '辉县市',
            value: '410782',
            children: null,
          },
        ],
      },
      {
        label: '焦作市',
        value: '410800',
        children: [
          {
            label: '解放区',
            value: '410802',
            children: null,
          },
          {
            label: '中站区',
            value: '410803',
            children: null,
          },
          {
            label: '马村区',
            value: '410804',
            children: null,
          },
          {
            label: '山阳区',
            value: '410811',
            children: null,
          },
          {
            label: '修武县',
            value: '410821',
            children: null,
          },
          {
            label: '博爱县',
            value: '410822',
            children: null,
          },
          {
            label: '武陟县',
            value: '410823',
            children: null,
          },
          {
            label: '温县',
            value: '410825',
            children: null,
          },
          {
            label: '沁阳市',
            value: '410882',
            children: null,
          },
          {
            label: '孟州市',
            value: '410883',
            children: null,
          },
        ],
      },
      {
        label: '濮阳市',
        value: '410900',
        children: [
          {
            label: '华龙区',
            value: '410902',
            children: null,
          },
          {
            label: '清丰县',
            value: '410922',
            children: null,
          },
          {
            label: '南乐县',
            value: '410923',
            children: null,
          },
          {
            label: '范县',
            value: '410926',
            children: null,
          },
          {
            label: '台前县',
            value: '410927',
            children: null,
          },
          {
            label: '濮阳县',
            value: '410928',
            children: null,
          },
        ],
      },
      {
        label: '许昌市',
        value: '411000',
        children: [
          {
            label: '魏都区',
            value: '411002',
            children: null,
          },
          {
            label: '建安区',
            value: '411003',
            children: null,
          },
          {
            label: '鄢陵县',
            value: '411024',
            children: null,
          },
          {
            label: '襄城县',
            value: '411025',
            children: null,
          },
          {
            label: '禹州市',
            value: '411081',
            children: null,
          },
          {
            label: '长葛市',
            value: '411082',
            children: null,
          },
        ],
      },
      {
        label: '漯河市',
        value: '411100',
        children: [
          {
            label: '源汇区',
            value: '411102',
            children: null,
          },
          {
            label: '郾城区',
            value: '411103',
            children: null,
          },
          {
            label: '召陵区',
            value: '411104',
            children: null,
          },
          {
            label: '舞阳县',
            value: '411121',
            children: null,
          },
          {
            label: '临颍县',
            value: '411122',
            children: null,
          },
        ],
      },
      {
        label: '三门峡市',
        value: '411200',
        children: [
          {
            label: '湖滨区',
            value: '411202',
            children: null,
          },
          {
            label: '陕州区',
            value: '411203',
            children: null,
          },
          {
            label: '渑池县',
            value: '411221',
            children: null,
          },
          {
            label: '卢氏县',
            value: '411224',
            children: null,
          },
          {
            label: '义马市',
            value: '411281',
            children: null,
          },
          {
            label: '灵宝市',
            value: '411282',
            children: null,
          },
        ],
      },
      {
        label: '南阳市',
        value: '411300',
        children: [
          {
            label: '宛城区',
            value: '411302',
            children: null,
          },
          {
            label: '卧龙区',
            value: '411303',
            children: null,
          },
          {
            label: '南召县',
            value: '411321',
            children: null,
          },
          {
            label: '方城县',
            value: '411322',
            children: null,
          },
          {
            label: '西峡县',
            value: '411323',
            children: null,
          },
          {
            label: '镇平县',
            value: '411324',
            children: null,
          },
          {
            label: '内乡县',
            value: '411325',
            children: null,
          },
          {
            label: '淅川县',
            value: '411326',
            children: null,
          },
          {
            label: '社旗县',
            value: '411327',
            children: null,
          },
          {
            label: '唐河县',
            value: '411328',
            children: null,
          },
          {
            label: '新野县',
            value: '411329',
            children: null,
          },
          {
            label: '桐柏县',
            value: '411330',
            children: null,
          },
          {
            label: '邓州市',
            value: '411381',
            children: null,
          },
        ],
      },
      {
        label: '商丘市',
        value: '411400',
        children: [
          {
            label: '梁园区',
            value: '411402',
            children: null,
          },
          {
            label: '睢阳区',
            value: '411403',
            children: null,
          },
          {
            label: '民权县',
            value: '411421',
            children: null,
          },
          {
            label: '睢县',
            value: '411422',
            children: null,
          },
          {
            label: '宁陵县',
            value: '411423',
            children: null,
          },
          {
            label: '柘城县',
            value: '411424',
            children: null,
          },
          {
            label: '虞城县',
            value: '411425',
            children: null,
          },
          {
            label: '夏邑县',
            value: '411426',
            children: null,
          },
          {
            label: '永城市',
            value: '411481',
            children: null,
          },
        ],
      },
      {
        label: '信阳市',
        value: '411500',
        children: [
          {
            label: '浉河区',
            value: '411502',
            children: null,
          },
          {
            label: '平桥区',
            value: '411503',
            children: null,
          },
          {
            label: '罗山县',
            value: '411521',
            children: null,
          },
          {
            label: '光山县',
            value: '411522',
            children: null,
          },
          {
            label: '新县',
            value: '411523',
            children: null,
          },
          {
            label: '商城县',
            value: '411524',
            children: null,
          },
          {
            label: '固始县',
            value: '411525',
            children: null,
          },
          {
            label: '潢川县',
            value: '411526',
            children: null,
          },
          {
            label: '淮滨县',
            value: '411527',
            children: null,
          },
          {
            label: '息县',
            value: '411528',
            children: null,
          },
        ],
      },
      {
        label: '周口市',
        value: '411600',
        children: [
          {
            label: '川汇区',
            value: '411602',
            children: null,
          },
          {
            label: '扶沟县',
            value: '411621',
            children: null,
          },
          {
            label: '西华县',
            value: '411622',
            children: null,
          },
          {
            label: '商水县',
            value: '411623',
            children: null,
          },
          {
            label: '沈丘县',
            value: '411624',
            children: null,
          },
          {
            label: '郸城县',
            value: '411625',
            children: null,
          },
          {
            label: '淮阳县',
            value: '411626',
            children: null,
          },
          {
            label: '太康县',
            value: '411627',
            children: null,
          },
          {
            label: '鹿邑县',
            value: '411628',
            children: null,
          },
          {
            label: '项城市',
            value: '411681',
            children: null,
          },
        ],
      },
      {
        label: '驻马店市',
        value: '411700',
        children: [
          {
            label: '驿城区',
            value: '411702',
            children: null,
          },
          {
            label: '西平县',
            value: '411721',
            children: null,
          },
          {
            label: '上蔡县',
            value: '411722',
            children: null,
          },
          {
            label: '平舆县',
            value: '411723',
            children: null,
          },
          {
            label: '正阳县',
            value: '411724',
            children: null,
          },
          {
            label: '确山县',
            value: '411725',
            children: null,
          },
          {
            label: '泌阳县',
            value: '411726',
            children: null,
          },
          {
            label: '汝南县',
            value: '411727',
            children: null,
          },
          {
            label: '遂平县',
            value: '411728',
            children: null,
          },
          {
            label: '新蔡县',
            value: '411729',
            children: null,
          },
        ],
      },
      {
        label: '济源市',
        value: '419001',
        children: [
          {
            label: '沁园街道',
            value: '419001001',
            children: null,
          },
          {
            label: '济水街道',
            value: '419001002',
            children: null,
          },
          {
            label: '北海街道',
            value: '419001003',
            children: null,
          },
          {
            label: '天坛街道',
            value: '419001004',
            children: null,
          },
          {
            label: '玉泉街道',
            value: '419001005',
            children: null,
          },
          {
            label: '克井镇',
            value: '419001100',
            children: null,
          },
          {
            label: '五龙口镇',
            value: '419001101',
            children: null,
          },
          {
            label: '轵城镇',
            value: '419001102',
            children: null,
          },
          {
            label: '承留镇',
            value: '419001103',
            children: null,
          },
          {
            label: '邵原镇',
            value: '419001104',
            children: null,
          },
          {
            label: '坡头镇',
            value: '419001105',
            children: null,
          },
          {
            label: '梨林镇',
            value: '419001106',
            children: null,
          },
          {
            label: '大峪镇',
            value: '419001107',
            children: null,
          },
          {
            label: '思礼镇',
            value: '419001108',
            children: null,
          },
          {
            label: '王屋镇',
            value: '419001109',
            children: null,
          },
          {
            label: '下冶镇',
            value: '419001110',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '湖北省',
    value: '420000',
    children: [
      {
        label: '武汉市',
        value: '420100',
        children: [
          {
            label: '江岸区',
            value: '420102',
            children: null,
          },
          {
            label: '江汉区',
            value: '420103',
            children: null,
          },
          {
            label: '硚口区',
            value: '420104',
            children: null,
          },
          {
            label: '汉阳区',
            value: '420105',
            children: null,
          },
          {
            label: '武昌区',
            value: '420106',
            children: null,
          },
          {
            label: '青山区',
            value: '420107',
            children: null,
          },
          {
            label: '洪山区',
            value: '420111',
            children: null,
          },
          {
            label: '东西湖区',
            value: '420112',
            children: null,
          },
          {
            label: '汉南区',
            value: '420113',
            children: null,
          },
          {
            label: '蔡甸区',
            value: '420114',
            children: null,
          },
          {
            label: '江夏区',
            value: '420115',
            children: null,
          },
          {
            label: '黄陂区',
            value: '420116',
            children: null,
          },
          {
            label: '新洲区',
            value: '420117',
            children: null,
          },
        ],
      },
      {
        label: '黄石市',
        value: '420200',
        children: [
          {
            label: '黄石港区',
            value: '420202',
            children: null,
          },
          {
            label: '西塞山区',
            value: '420203',
            children: null,
          },
          {
            label: '下陆区',
            value: '420204',
            children: null,
          },
          {
            label: '铁山区',
            value: '420205',
            children: null,
          },
          {
            label: '阳新县',
            value: '420222',
            children: null,
          },
          {
            label: '大冶市',
            value: '420281',
            children: null,
          },
        ],
      },
      {
        label: '十堰市',
        value: '420300',
        children: [
          {
            label: '茅箭区',
            value: '420302',
            children: null,
          },
          {
            label: '张湾区',
            value: '420303',
            children: null,
          },
          {
            label: '郧阳区',
            value: '420304',
            children: null,
          },
          {
            label: '郧西县',
            value: '420322',
            children: null,
          },
          {
            label: '竹山县',
            value: '420323',
            children: null,
          },
          {
            label: '竹溪县',
            value: '420324',
            children: null,
          },
          {
            label: '房县',
            value: '420325',
            children: null,
          },
          {
            label: '丹江口市',
            value: '420381',
            children: null,
          },
        ],
      },
      {
        label: '宜昌市',
        value: '420500',
        children: [
          {
            label: '西陵区',
            value: '420502',
            children: null,
          },
          {
            label: '伍家岗区',
            value: '420503',
            children: null,
          },
          {
            label: '点军区',
            value: '420504',
            children: null,
          },
          {
            label: '猇亭区',
            value: '420505',
            children: null,
          },
          {
            label: '夷陵区',
            value: '420506',
            children: null,
          },
          {
            label: '远安县',
            value: '420525',
            children: null,
          },
          {
            label: '兴山县',
            value: '420526',
            children: null,
          },
          {
            label: '秭归县',
            value: '420527',
            children: null,
          },
          {
            label: '长阳土家族自治县',
            value: '420528',
            children: null,
          },
          {
            label: '五峰土家族自治县',
            value: '420529',
            children: null,
          },
          {
            label: '宜都市',
            value: '420581',
            children: null,
          },
          {
            label: '当阳市',
            value: '420582',
            children: null,
          },
          {
            label: '枝江市',
            value: '420583',
            children: null,
          },
        ],
      },
      {
        label: '襄阳市',
        value: '420600',
        children: [
          {
            label: '襄城区',
            value: '420602',
            children: null,
          },
          {
            label: '樊城区',
            value: '420606',
            children: null,
          },
          {
            label: '襄州区',
            value: '420607',
            children: null,
          },
          {
            label: '南漳县',
            value: '420624',
            children: null,
          },
          {
            label: '谷城县',
            value: '420625',
            children: null,
          },
          {
            label: '保康县',
            value: '420626',
            children: null,
          },
          {
            label: '老河口市',
            value: '420682',
            children: null,
          },
          {
            label: '枣阳市',
            value: '420683',
            children: null,
          },
          {
            label: '宜城市',
            value: '420684',
            children: null,
          },
        ],
      },
      {
        label: '鄂州市',
        value: '420700',
        children: [
          {
            label: '梁子湖区',
            value: '420702',
            children: null,
          },
          {
            label: '华容区',
            value: '420703',
            children: null,
          },
          {
            label: '鄂城区',
            value: '420704',
            children: null,
          },
        ],
      },
      {
        label: '荆门市',
        value: '420800',
        children: [
          {
            label: '东宝区',
            value: '420802',
            children: null,
          },
          {
            label: '掇刀区',
            value: '420804',
            children: null,
          },
          {
            label: '沙洋县',
            value: '420822',
            children: null,
          },
          {
            label: '钟祥市',
            value: '420881',
            children: null,
          },
          {
            label: '京山市',
            value: '420882',
            children: null,
          },
        ],
      },
      {
        label: '孝感市',
        value: '420900',
        children: [
          {
            label: '孝南区',
            value: '420902',
            children: null,
          },
          {
            label: '孝昌县',
            value: '420921',
            children: null,
          },
          {
            label: '大悟县',
            value: '420922',
            children: null,
          },
          {
            label: '云梦县',
            value: '420923',
            children: null,
          },
          {
            label: '应城市',
            value: '420981',
            children: null,
          },
          {
            label: '安陆市',
            value: '420982',
            children: null,
          },
          {
            label: '汉川市',
            value: '420984',
            children: null,
          },
        ],
      },
      {
        label: '荆州市',
        value: '421000',
        children: [
          {
            label: '沙市区',
            value: '421002',
            children: null,
          },
          {
            label: '荆州区',
            value: '421003',
            children: null,
          },
          {
            label: '公安县',
            value: '421022',
            children: null,
          },
          {
            label: '监利县',
            value: '421023',
            children: null,
          },
          {
            label: '江陵县',
            value: '421024',
            children: null,
          },
          {
            label: '石首市',
            value: '421081',
            children: null,
          },
          {
            label: '洪湖市',
            value: '421083',
            children: null,
          },
          {
            label: '松滋市',
            value: '421087',
            children: null,
          },
        ],
      },
      {
        label: '黄冈市',
        value: '421100',
        children: [
          {
            label: '黄州区',
            value: '421102',
            children: null,
          },
          {
            label: '团风县',
            value: '421121',
            children: null,
          },
          {
            label: '红安县',
            value: '421122',
            children: null,
          },
          {
            label: '罗田县',
            value: '421123',
            children: null,
          },
          {
            label: '英山县',
            value: '421124',
            children: null,
          },
          {
            label: '浠水县',
            value: '421125',
            children: null,
          },
          {
            label: '蕲春县',
            value: '421126',
            children: null,
          },
          {
            label: '黄梅县',
            value: '421127',
            children: null,
          },
          {
            label: '麻城市',
            value: '421181',
            children: null,
          },
          {
            label: '武穴市',
            value: '421182',
            children: null,
          },
        ],
      },
      {
        label: '咸宁市',
        value: '421200',
        children: [
          {
            label: '咸安区',
            value: '421202',
            children: null,
          },
          {
            label: '嘉鱼县',
            value: '421221',
            children: null,
          },
          {
            label: '通城县',
            value: '421222',
            children: null,
          },
          {
            label: '崇阳县',
            value: '421223',
            children: null,
          },
          {
            label: '通山县',
            value: '421224',
            children: null,
          },
          {
            label: '赤壁市',
            value: '421281',
            children: null,
          },
        ],
      },
      {
        label: '随州市',
        value: '421300',
        children: [
          {
            label: '曾都区',
            value: '421303',
            children: null,
          },
          {
            label: '随县',
            value: '421321',
            children: null,
          },
          {
            label: '广水市',
            value: '421381',
            children: null,
          },
        ],
      },
      {
        label: '恩施土家族苗族自治州',
        value: '422800',
        children: [
          {
            label: '恩施市',
            value: '422801',
            children: null,
          },
          {
            label: '利川市',
            value: '422802',
            children: null,
          },
          {
            label: '建始县',
            value: '422822',
            children: null,
          },
          {
            label: '巴东县',
            value: '422823',
            children: null,
          },
          {
            label: '宣恩县',
            value: '422825',
            children: null,
          },
          {
            label: '咸丰县',
            value: '422826',
            children: null,
          },
          {
            label: '来凤县',
            value: '422827',
            children: null,
          },
          {
            label: '鹤峰县',
            value: '422828',
            children: null,
          },
        ],
      },
      {
        label: '仙桃市',
        value: '429004',
        children: [
          {
            label: '沙嘴街道',
            value: '429004001',
            children: null,
          },
          {
            label: '干河街道',
            value: '429004002',
            children: null,
          },
          {
            label: '龙华山街道',
            value: '429004003',
            children: null,
          },
          {
            label: '郑场镇',
            value: '429004100',
            children: null,
          },
          {
            label: '毛嘴镇',
            value: '429004101',
            children: null,
          },
          {
            label: '豆河镇',
            value: '429004102',
            children: null,
          },
          {
            label: '三伏潭镇',
            value: '429004103',
            children: null,
          },
          {
            label: '胡场镇',
            value: '429004104',
            children: null,
          },
          {
            label: '长倘口镇',
            value: '429004105',
            children: null,
          },
          {
            label: '西流河镇',
            value: '429004106',
            children: null,
          },
          {
            label: '沙湖镇',
            value: '429004107',
            children: null,
          },
          {
            label: '杨林尾镇',
            value: '429004108',
            children: null,
          },
          {
            label: '彭场镇',
            value: '429004109',
            children: null,
          },
          {
            label: '张沟镇',
            value: '429004110',
            children: null,
          },
          {
            label: '郭河镇',
            value: '429004111',
            children: null,
          },
          {
            label: '沔城回族镇',
            value: '429004112',
            children: null,
          },
          {
            label: '通海口镇',
            value: '429004113',
            children: null,
          },
          {
            label: '陈场镇',
            value: '429004114',
            children: null,
          },
          {
            label: '工业园区',
            value: '429004400',
            children: null,
          },
          {
            label: '九合垸原种场',
            value: '429004401',
            children: null,
          },
          {
            label: '五湖渔场',
            value: '429004404',
            children: null,
          },
          {
            label: '赵西垸林场',
            value: '429004405',
            children: null,
          },
          {
            label: '畜禽良种场',
            value: '429004407',
            children: null,
          },
        ],
      },
      {
        label: '潜江市',
        value: '429005',
        children: [
          {
            label: '园林街道',
            value: '429005001',
            children: null,
          },
          {
            label: '周矶街道',
            value: '429005003',
            children: null,
          },
          {
            label: '广华街道',
            value: '429005004',
            children: null,
          },
          {
            label: '泰丰街道',
            value: '429005005',
            children: null,
          },
          {
            label: '高场街道',
            value: '429005006',
            children: null,
          },
          {
            label: '竹根滩镇',
            value: '429005100',
            children: null,
          },
          {
            label: '渔洋镇',
            value: '429005101',
            children: null,
          },
          {
            label: '王场镇',
            value: '429005102',
            children: null,
          },
          {
            label: '高石碑镇',
            value: '429005103',
            children: null,
          },
          {
            label: '熊口镇',
            value: '429005104',
            children: null,
          },
          {
            label: '老新镇',
            value: '429005105',
            children: null,
          },
          {
            label: '浩口镇',
            value: '429005106',
            children: null,
          },
          {
            label: '积玉口镇',
            value: '429005107',
            children: null,
          },
          {
            label: '张金镇',
            value: '429005108',
            children: null,
          },
          {
            label: '龙湾镇',
            value: '429005109',
            children: null,
          },
          {
            label: '后湖管理区',
            value: '429005451',
            children: null,
          },
          {
            label: '熊口管理区',
            value: '429005452',
            children: null,
          },
          {
            label: '总口管理区',
            value: '429005453',
            children: null,
          },
          {
            label: '白鹭湖管理区',
            value: '429005454',
            children: null,
          },
          {
            label: '运粮湖管理区',
            value: '429005455',
            children: null,
          },
          {
            label: '杨市街道',
            value: '429005900',
            children: null,
          },
          {
            label: '广华寺农场',
            value: '429005950',
            children: null,
          },
        ],
      },
      {
        label: '天门市',
        value: '429006',
        children: [
          {
            label: '竟陵街道',
            value: '429006001',
            children: null,
          },
          {
            label: '侨乡街道开发区',
            value: '429006002',
            children: null,
          },
          {
            label: '杨林街道',
            value: '429006003',
            children: null,
          },
          {
            label: '多宝镇',
            value: '429006100',
            children: null,
          },
          {
            label: '拖市镇',
            value: '429006101',
            children: null,
          },
          {
            label: '张港镇',
            value: '429006102',
            children: null,
          },
          {
            label: '蒋场镇',
            value: '429006103',
            children: null,
          },
          {
            label: '汪场镇',
            value: '429006104',
            children: null,
          },
          {
            label: '渔薪镇',
            value: '429006105',
            children: null,
          },
          {
            label: '黄潭镇',
            value: '429006106',
            children: null,
          },
          {
            label: '岳口镇',
            value: '429006107',
            children: null,
          },
          {
            label: '横林镇',
            value: '429006108',
            children: null,
          },
          {
            label: '彭市镇',
            value: '429006109',
            children: null,
          },
          {
            label: '麻洋镇',
            value: '429006110',
            children: null,
          },
          {
            label: '多祥镇',
            value: '429006111',
            children: null,
          },
          {
            label: '干驿镇',
            value: '429006112',
            children: null,
          },
          {
            label: '马湾镇',
            value: '429006113',
            children: null,
          },
          {
            label: '卢市镇',
            value: '429006114',
            children: null,
          },
          {
            label: '小板镇',
            value: '429006115',
            children: null,
          },
          {
            label: '九真镇',
            value: '429006116',
            children: null,
          },
          {
            label: '皂市镇',
            value: '429006118',
            children: null,
          },
          {
            label: '胡市镇',
            value: '429006119',
            children: null,
          },
          {
            label: '石河镇',
            value: '429006120',
            children: null,
          },
          {
            label: '佛子山镇',
            value: '429006121',
            children: null,
          },
          {
            label: '净潭乡',
            value: '429006201',
            children: null,
          },
          {
            label: '蒋湖农场',
            value: '429006450',
            children: null,
          },
          {
            label: '白茅湖农场',
            value: '429006451',
            children: null,
          },
          {
            label: '沉湖管委会',
            value: '429006452',
            children: null,
          },
        ],
      },
      {
        label: '神农架林区',
        value: '429021',
        children: [
          {
            label: '松柏镇',
            value: '429021100',
            children: null,
          },
          {
            label: '阳日镇',
            value: '429021101',
            children: null,
          },
          {
            label: '木鱼镇',
            value: '429021102',
            children: null,
          },
          {
            label: '红坪镇',
            value: '429021103',
            children: null,
          },
          {
            label: '新华镇',
            value: '429021104',
            children: null,
          },
          {
            label: '九湖镇',
            value: '429021105',
            children: null,
          },
          {
            label: '宋洛乡',
            value: '429021200',
            children: null,
          },
          {
            label: '下谷坪土家族乡',
            value: '429021202',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '湖南省',
    value: '430000',
    children: [
      {
        label: '长沙市',
        value: '430100',
        children: [
          {
            label: '芙蓉区',
            value: '430102',
            children: null,
          },
          {
            label: '天心区',
            value: '430103',
            children: null,
          },
          {
            label: '岳麓区',
            value: '430104',
            children: null,
          },
          {
            label: '开福区',
            value: '430105',
            children: null,
          },
          {
            label: '雨花区',
            value: '430111',
            children: null,
          },
          {
            label: '望城区',
            value: '430112',
            children: null,
          },
          {
            label: '长沙县',
            value: '430121',
            children: null,
          },
          {
            label: '浏阳市',
            value: '430181',
            children: null,
          },
          {
            label: '宁乡市',
            value: '430182',
            children: null,
          },
        ],
      },
      {
        label: '株洲市',
        value: '430200',
        children: [
          {
            label: '荷塘区',
            value: '430202',
            children: null,
          },
          {
            label: '芦淞区',
            value: '430203',
            children: null,
          },
          {
            label: '石峰区',
            value: '430204',
            children: null,
          },
          {
            label: '天元区',
            value: '430211',
            children: null,
          },
          {
            label: '渌口区',
            value: '430212',
            children: null,
          },
          {
            label: '攸县',
            value: '430223',
            children: null,
          },
          {
            label: '茶陵县',
            value: '430224',
            children: null,
          },
          {
            label: '炎陵县',
            value: '430225',
            children: null,
          },
          {
            label: '醴陵市',
            value: '430281',
            children: null,
          },
        ],
      },
      {
        label: '湘潭市',
        value: '430300',
        children: [
          {
            label: '雨湖区',
            value: '430302',
            children: null,
          },
          {
            label: '岳塘区',
            value: '430304',
            children: null,
          },
          {
            label: '湘潭县',
            value: '430321',
            children: null,
          },
          {
            label: '湘乡市',
            value: '430381',
            children: null,
          },
          {
            label: '韶山市',
            value: '430382',
            children: null,
          },
        ],
      },
      {
        label: '衡阳市',
        value: '430400',
        children: [
          {
            label: '珠晖区',
            value: '430405',
            children: null,
          },
          {
            label: '雁峰区',
            value: '430406',
            children: null,
          },
          {
            label: '石鼓区',
            value: '430407',
            children: null,
          },
          {
            label: '蒸湘区',
            value: '430408',
            children: null,
          },
          {
            label: '南岳区',
            value: '430412',
            children: null,
          },
          {
            label: '衡阳县',
            value: '430421',
            children: null,
          },
          {
            label: '衡南县',
            value: '430422',
            children: null,
          },
          {
            label: '衡山县',
            value: '430423',
            children: null,
          },
          {
            label: '衡东县',
            value: '430424',
            children: null,
          },
          {
            label: '祁东县',
            value: '430426',
            children: null,
          },
          {
            label: '耒阳市',
            value: '430481',
            children: null,
          },
          {
            label: '常宁市',
            value: '430482',
            children: null,
          },
        ],
      },
      {
        label: '邵阳市',
        value: '430500',
        children: [
          {
            label: '双清区',
            value: '430502',
            children: null,
          },
          {
            label: '大祥区',
            value: '430503',
            children: null,
          },
          {
            label: '北塔区',
            value: '430511',
            children: null,
          },
          {
            label: '邵东县',
            value: '430521',
            children: null,
          },
          {
            label: '新邵县',
            value: '430522',
            children: null,
          },
          {
            label: '邵阳县',
            value: '430523',
            children: null,
          },
          {
            label: '隆回县',
            value: '430524',
            children: null,
          },
          {
            label: '洞口县',
            value: '430525',
            children: null,
          },
          {
            label: '绥宁县',
            value: '430527',
            children: null,
          },
          {
            label: '新宁县',
            value: '430528',
            children: null,
          },
          {
            label: '城步苗族自治县',
            value: '430529',
            children: null,
          },
          {
            label: '武冈市',
            value: '430581',
            children: null,
          },
        ],
      },
      {
        label: '岳阳市',
        value: '430600',
        children: [
          {
            label: '岳阳楼区',
            value: '430602',
            children: null,
          },
          {
            label: '云溪区',
            value: '430603',
            children: null,
          },
          {
            label: '君山区',
            value: '430611',
            children: null,
          },
          {
            label: '岳阳县',
            value: '430621',
            children: null,
          },
          {
            label: '华容县',
            value: '430623',
            children: null,
          },
          {
            label: '湘阴县',
            value: '430624',
            children: null,
          },
          {
            label: '平江县',
            value: '430626',
            children: null,
          },
          {
            label: '汨罗市',
            value: '430681',
            children: null,
          },
          {
            label: '临湘市',
            value: '430682',
            children: null,
          },
        ],
      },
      {
        label: '常德市',
        value: '430700',
        children: [
          {
            label: '武陵区',
            value: '430702',
            children: null,
          },
          {
            label: '鼎城区',
            value: '430703',
            children: null,
          },
          {
            label: '安乡县',
            value: '430721',
            children: null,
          },
          {
            label: '汉寿县',
            value: '430722',
            children: null,
          },
          {
            label: '澧县',
            value: '430723',
            children: null,
          },
          {
            label: '临澧县',
            value: '430724',
            children: null,
          },
          {
            label: '桃源县',
            value: '430725',
            children: null,
          },
          {
            label: '石门县',
            value: '430726',
            children: null,
          },
          {
            label: '津市市',
            value: '430781',
            children: null,
          },
        ],
      },
      {
        label: '张家界市',
        value: '430800',
        children: [
          {
            label: '永定区',
            value: '430802',
            children: null,
          },
          {
            label: '武陵源区',
            value: '430811',
            children: null,
          },
          {
            label: '慈利县',
            value: '430821',
            children: null,
          },
          {
            label: '桑植县',
            value: '430822',
            children: null,
          },
        ],
      },
      {
        label: '益阳市',
        value: '430900',
        children: [
          {
            label: '资阳区',
            value: '430902',
            children: null,
          },
          {
            label: '赫山区',
            value: '430903',
            children: null,
          },
          {
            label: '南县',
            value: '430921',
            children: null,
          },
          {
            label: '桃江县',
            value: '430922',
            children: null,
          },
          {
            label: '安化县',
            value: '430923',
            children: null,
          },
          {
            label: '沅江市',
            value: '430981',
            children: null,
          },
        ],
      },
      {
        label: '郴州市',
        value: '431000',
        children: [
          {
            label: '北湖区',
            value: '431002',
            children: null,
          },
          {
            label: '苏仙区',
            value: '431003',
            children: null,
          },
          {
            label: '桂阳县',
            value: '431021',
            children: null,
          },
          {
            label: '宜章县',
            value: '431022',
            children: null,
          },
          {
            label: '永兴县',
            value: '431023',
            children: null,
          },
          {
            label: '嘉禾县',
            value: '431024',
            children: null,
          },
          {
            label: '临武县',
            value: '431025',
            children: null,
          },
          {
            label: '汝城县',
            value: '431026',
            children: null,
          },
          {
            label: '桂东县',
            value: '431027',
            children: null,
          },
          {
            label: '安仁县',
            value: '431028',
            children: null,
          },
          {
            label: '资兴市',
            value: '431081',
            children: null,
          },
        ],
      },
      {
        label: '永州市',
        value: '431100',
        children: [
          {
            label: '零陵区',
            value: '431102',
            children: null,
          },
          {
            label: '冷水滩区',
            value: '431103',
            children: null,
          },
          {
            label: '祁阳县',
            value: '431121',
            children: null,
          },
          {
            label: '东安县',
            value: '431122',
            children: null,
          },
          {
            label: '双牌县',
            value: '431123',
            children: null,
          },
          {
            label: '道县',
            value: '431124',
            children: null,
          },
          {
            label: '江永县',
            value: '431125',
            children: null,
          },
          {
            label: '宁远县',
            value: '431126',
            children: null,
          },
          {
            label: '蓝山县',
            value: '431127',
            children: null,
          },
          {
            label: '新田县',
            value: '431128',
            children: null,
          },
          {
            label: '江华瑶族自治县',
            value: '431129',
            children: null,
          },
        ],
      },
      {
        label: '怀化市',
        value: '431200',
        children: [
          {
            label: '鹤城区',
            value: '431202',
            children: null,
          },
          {
            label: '中方县',
            value: '431221',
            children: null,
          },
          {
            label: '沅陵县',
            value: '431222',
            children: null,
          },
          {
            label: '辰溪县',
            value: '431223',
            children: null,
          },
          {
            label: '溆浦县',
            value: '431224',
            children: null,
          },
          {
            label: '会同县',
            value: '431225',
            children: null,
          },
          {
            label: '麻阳苗族自治县',
            value: '431226',
            children: null,
          },
          {
            label: '新晃侗族自治县',
            value: '431227',
            children: null,
          },
          {
            label: '芷江侗族自治县',
            value: '431228',
            children: null,
          },
          {
            label: '靖州苗族侗族自治县',
            value: '431229',
            children: null,
          },
          {
            label: '通道侗族自治县',
            value: '431230',
            children: null,
          },
          {
            label: '洪江市',
            value: '431281',
            children: null,
          },
        ],
      },
      {
        label: '娄底市',
        value: '431300',
        children: [
          {
            label: '娄星区',
            value: '431302',
            children: null,
          },
          {
            label: '双峰县',
            value: '431321',
            children: null,
          },
          {
            label: '新化县',
            value: '431322',
            children: null,
          },
          {
            label: '冷水江市',
            value: '431381',
            children: null,
          },
          {
            label: '涟源市',
            value: '431382',
            children: null,
          },
        ],
      },
      {
        label: '湘西土家族苗族自治州',
        value: '433100',
        children: [
          {
            label: '吉首市',
            value: '433101',
            children: null,
          },
          {
            label: '泸溪县',
            value: '433122',
            children: null,
          },
          {
            label: '凤凰县',
            value: '433123',
            children: null,
          },
          {
            label: '花垣县',
            value: '433124',
            children: null,
          },
          {
            label: '保靖县',
            value: '433125',
            children: null,
          },
          {
            label: '古丈县',
            value: '433126',
            children: null,
          },
          {
            label: '永顺县',
            value: '433127',
            children: null,
          },
          {
            label: '龙山县',
            value: '433130',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '广东省',
    value: '440000',
    children: [
      {
        label: '广州市',
        value: '440100',
        children: [
          {
            label: '荔湾区',
            value: '440103',
            children: null,
          },
          {
            label: '越秀区',
            value: '440104',
            children: null,
          },
          {
            label: '海珠区',
            value: '440105',
            children: null,
          },
          {
            label: '天河区',
            value: '440106',
            children: null,
          },
          {
            label: '白云区',
            value: '440111',
            children: null,
          },
          {
            label: '黄埔区',
            value: '440112',
            children: null,
          },
          {
            label: '番禺区',
            value: '440113',
            children: null,
          },
          {
            label: '花都区',
            value: '440114',
            children: null,
          },
          {
            label: '南沙区',
            value: '440115',
            children: null,
          },
          {
            label: '从化区',
            value: '440117',
            children: null,
          },
          {
            label: '增城区',
            value: '440118',
            children: null,
          },
        ],
      },
      {
        label: '韶关市',
        value: '440200',
        children: [
          {
            label: '武江区',
            value: '440203',
            children: null,
          },
          {
            label: '浈江区',
            value: '440204',
            children: null,
          },
          {
            label: '曲江区',
            value: '440205',
            children: null,
          },
          {
            label: '始兴县',
            value: '440222',
            children: null,
          },
          {
            label: '仁化县',
            value: '440224',
            children: null,
          },
          {
            label: '翁源县',
            value: '440229',
            children: null,
          },
          {
            label: '乳源瑶族自治县',
            value: '440232',
            children: null,
          },
          {
            label: '新丰县',
            value: '440233',
            children: null,
          },
          {
            label: '乐昌市',
            value: '440281',
            children: null,
          },
          {
            label: '南雄市',
            value: '440282',
            children: null,
          },
        ],
      },
      {
        label: '深圳市',
        value: '440300',
        children: [
          {
            label: '罗湖区',
            value: '440303',
            children: null,
          },
          {
            label: '福田区',
            value: '440304',
            children: null,
          },
          {
            label: '南山区',
            value: '440305',
            children: null,
          },
          {
            label: '宝安区',
            value: '440306',
            children: null,
          },
          {
            label: '龙岗区',
            value: '440307',
            children: null,
          },
          {
            label: '盐田区',
            value: '440308',
            children: null,
          },
          {
            label: '龙华区',
            value: '440309',
            children: null,
          },
          {
            label: '坪山区',
            value: '440310',
            children: null,
          },
          {
            label: '光明区',
            value: '440311',
            children: null,
          },
        ],
      },
      {
        label: '珠海市',
        value: '440400',
        children: [
          {
            label: '香洲区',
            value: '440402',
            children: null,
          },
          {
            label: '斗门区',
            value: '440403',
            children: null,
          },
          {
            label: '金湾区',
            value: '440404',
            children: null,
          },
          {
            label: '香洲区横琴校区(由澳门特别行政区实施管辖)',
            value: '440499',
            children: null,
          },
        ],
      },
      {
        label: '汕头市',
        value: '440500',
        children: [
          {
            label: '龙湖区',
            value: '440507',
            children: null,
          },
          {
            label: '金平区',
            value: '440511',
            children: null,
          },
          {
            label: '濠江区',
            value: '440512',
            children: null,
          },
          {
            label: '潮阳区',
            value: '440513',
            children: null,
          },
          {
            label: '潮南区',
            value: '440514',
            children: null,
          },
          {
            label: '澄海区',
            value: '440515',
            children: null,
          },
          {
            label: '南澳县',
            value: '440523',
            children: null,
          },
        ],
      },
      {
        label: '佛山市',
        value: '440600',
        children: [
          {
            label: '禅城区',
            value: '440604',
            children: null,
          },
          {
            label: '南海区',
            value: '440605',
            children: null,
          },
          {
            label: '顺德区',
            value: '440606',
            children: null,
          },
          {
            label: '三水区',
            value: '440607',
            children: null,
          },
          {
            label: '高明区',
            value: '440608',
            children: null,
          },
        ],
      },
      {
        label: '江门市',
        value: '440700',
        children: [
          {
            label: '蓬江区',
            value: '440703',
            children: null,
          },
          {
            label: '江海区',
            value: '440704',
            children: null,
          },
          {
            label: '新会区',
            value: '440705',
            children: null,
          },
          {
            label: '台山市',
            value: '440781',
            children: null,
          },
          {
            label: '开平市',
            value: '440783',
            children: null,
          },
          {
            label: '鹤山市',
            value: '440784',
            children: null,
          },
          {
            label: '恩平市',
            value: '440785',
            children: null,
          },
        ],
      },
      {
        label: '湛江市',
        value: '440800',
        children: [
          {
            label: '赤坎区',
            value: '440802',
            children: null,
          },
          {
            label: '霞山区',
            value: '440803',
            children: null,
          },
          {
            label: '坡头区',
            value: '440804',
            children: null,
          },
          {
            label: '麻章区',
            value: '440811',
            children: null,
          },
          {
            label: '遂溪县',
            value: '440823',
            children: null,
          },
          {
            label: '徐闻县',
            value: '440825',
            children: null,
          },
          {
            label: '廉江市',
            value: '440881',
            children: null,
          },
          {
            label: '雷州市',
            value: '440882',
            children: null,
          },
          {
            label: '吴川市',
            value: '440883',
            children: null,
          },
        ],
      },
      {
        label: '茂名市',
        value: '440900',
        children: [
          {
            label: '茂南区',
            value: '440902',
            children: null,
          },
          {
            label: '电白区',
            value: '440904',
            children: null,
          },
          {
            label: '高州市',
            value: '440981',
            children: null,
          },
          {
            label: '化州市',
            value: '440982',
            children: null,
          },
          {
            label: '信宜市',
            value: '440983',
            children: null,
          },
        ],
      },
      {
        label: '肇庆市',
        value: '441200',
        children: [
          {
            label: '端州区',
            value: '441202',
            children: null,
          },
          {
            label: '鼎湖区',
            value: '441203',
            children: null,
          },
          {
            label: '高要区',
            value: '441204',
            children: null,
          },
          {
            label: '广宁县',
            value: '441223',
            children: null,
          },
          {
            label: '怀集县',
            value: '441224',
            children: null,
          },
          {
            label: '封开县',
            value: '441225',
            children: null,
          },
          {
            label: '德庆县',
            value: '441226',
            children: null,
          },
          {
            label: '四会市',
            value: '441284',
            children: null,
          },
        ],
      },
      {
        label: '惠州市',
        value: '441300',
        children: [
          {
            label: '惠城区',
            value: '441302',
            children: null,
          },
          {
            label: '惠阳区',
            value: '441303',
            children: null,
          },
          {
            label: '博罗县',
            value: '441322',
            children: null,
          },
          {
            label: '惠东县',
            value: '441323',
            children: null,
          },
          {
            label: '龙门县',
            value: '441324',
            children: null,
          },
        ],
      },
      {
        label: '梅州市',
        value: '441400',
        children: [
          {
            label: '梅江区',
            value: '441402',
            children: null,
          },
          {
            label: '梅县区',
            value: '441403',
            children: null,
          },
          {
            label: '大埔县',
            value: '441422',
            children: null,
          },
          {
            label: '丰顺县',
            value: '441423',
            children: null,
          },
          {
            label: '五华县',
            value: '441424',
            children: null,
          },
          {
            label: '平远县',
            value: '441426',
            children: null,
          },
          {
            label: '蕉岭县',
            value: '441427',
            children: null,
          },
          {
            label: '兴宁市',
            value: '441481',
            children: null,
          },
        ],
      },
      {
        label: '汕尾市',
        value: '441500',
        children: [
          {
            label: '城区',
            value: '441502',
            children: null,
          },
          {
            label: '海丰县',
            value: '441521',
            children: null,
          },
          {
            label: '陆河县',
            value: '441523',
            children: null,
          },
          {
            label: '陆丰市',
            value: '441581',
            children: null,
          },
        ],
      },
      {
        label: '河源市',
        value: '441600',
        children: [
          {
            label: '源城区',
            value: '441602',
            children: null,
          },
          {
            label: '紫金县',
            value: '441621',
            children: null,
          },
          {
            label: '龙川县',
            value: '441622',
            children: null,
          },
          {
            label: '连平县',
            value: '441623',
            children: null,
          },
          {
            label: '和平县',
            value: '441624',
            children: null,
          },
          {
            label: '东源县',
            value: '441625',
            children: null,
          },
        ],
      },
      {
        label: '阳江市',
        value: '441700',
        children: [
          {
            label: '江城区',
            value: '441702',
            children: null,
          },
          {
            label: '阳东区',
            value: '441704',
            children: null,
          },
          {
            label: '阳西县',
            value: '441721',
            children: null,
          },
          {
            label: '阳春市',
            value: '441781',
            children: null,
          },
        ],
      },
      {
        label: '清远市',
        value: '441800',
        children: [
          {
            label: '清城区',
            value: '441802',
            children: null,
          },
          {
            label: '清新区',
            value: '441803',
            children: null,
          },
          {
            label: '佛冈县',
            value: '441821',
            children: null,
          },
          {
            label: '阳山县',
            value: '441823',
            children: null,
          },
          {
            label: '连山壮族瑶族自治县',
            value: '441825',
            children: null,
          },
          {
            label: '连南瑶族自治县',
            value: '441826',
            children: null,
          },
          {
            label: '英德市',
            value: '441881',
            children: null,
          },
          {
            label: '连州市',
            value: '441882',
            children: null,
          },
        ],
      },
      {
        label: '东莞市',
        value: '441900',
        children: [
          {
            label: '东莞市',
            value: '441999',
            children: null,
          },
        ],
      },
      {
        label: '中山市',
        value: '442000',
        children: [
          {
            label: '中山市',
            value: '442099',
            children: null,
          },
        ],
      },
      {
        label: '潮州市',
        value: '445100',
        children: [
          {
            label: '湘桥区',
            value: '445102',
            children: null,
          },
          {
            label: '潮安区',
            value: '445103',
            children: null,
          },
          {
            label: '饶平县',
            value: '445122',
            children: null,
          },
        ],
      },
      {
        label: '揭阳市',
        value: '445200',
        children: [
          {
            label: '榕城区',
            value: '445202',
            children: null,
          },
          {
            label: '揭东区',
            value: '445203',
            children: null,
          },
          {
            label: '揭西县',
            value: '445222',
            children: null,
          },
          {
            label: '惠来县',
            value: '445224',
            children: null,
          },
          {
            label: '普宁市',
            value: '445281',
            children: null,
          },
        ],
      },
      {
        label: '云浮市',
        value: '445300',
        children: [
          {
            label: '云城区',
            value: '445302',
            children: null,
          },
          {
            label: '云安区',
            value: '445303',
            children: null,
          },
          {
            label: '新兴县',
            value: '445321',
            children: null,
          },
          {
            label: '郁南县',
            value: '445322',
            children: null,
          },
          {
            label: '罗定市',
            value: '445381',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '广西壮族自治区',
    value: '450000',
    children: [
      {
        label: '南宁市',
        value: '450100',
        children: [
          {
            label: '兴宁区',
            value: '450102',
            children: null,
          },
          {
            label: '青秀区',
            value: '450103',
            children: null,
          },
          {
            label: '江南区',
            value: '450105',
            children: null,
          },
          {
            label: '西乡塘区',
            value: '450107',
            children: null,
          },
          {
            label: '良庆区',
            value: '450108',
            children: null,
          },
          {
            label: '邕宁区',
            value: '450109',
            children: null,
          },
          {
            label: '武鸣区',
            value: '450110',
            children: null,
          },
          {
            label: '隆安县',
            value: '450123',
            children: null,
          },
          {
            label: '马山县',
            value: '450124',
            children: null,
          },
          {
            label: '上林县',
            value: '450125',
            children: null,
          },
          {
            label: '宾阳县',
            value: '450126',
            children: null,
          },
          {
            label: '横县',
            value: '450127',
            children: null,
          },
        ],
      },
      {
        label: '柳州市',
        value: '450200',
        children: [
          {
            label: '城中区',
            value: '450202',
            children: null,
          },
          {
            label: '鱼峰区',
            value: '450203',
            children: null,
          },
          {
            label: '柳南区',
            value: '450204',
            children: null,
          },
          {
            label: '柳北区',
            value: '450205',
            children: null,
          },
          {
            label: '柳江区',
            value: '450206',
            children: null,
          },
          {
            label: '柳城县',
            value: '450222',
            children: null,
          },
          {
            label: '鹿寨县',
            value: '450223',
            children: null,
          },
          {
            label: '融安县',
            value: '450224',
            children: null,
          },
          {
            label: '融水苗族自治县',
            value: '450225',
            children: null,
          },
          {
            label: '三江侗族自治县',
            value: '450226',
            children: null,
          },
        ],
      },
      {
        label: '桂林市',
        value: '450300',
        children: [
          {
            label: '秀峰区',
            value: '450302',
            children: null,
          },
          {
            label: '叠彩区',
            value: '450303',
            children: null,
          },
          {
            label: '象山区',
            value: '450304',
            children: null,
          },
          {
            label: '七星区',
            value: '450305',
            children: null,
          },
          {
            label: '雁山区',
            value: '450311',
            children: null,
          },
          {
            label: '临桂区',
            value: '450312',
            children: null,
          },
          {
            label: '阳朔县',
            value: '450321',
            children: null,
          },
          {
            label: '灵川县',
            value: '450323',
            children: null,
          },
          {
            label: '全州县',
            value: '450324',
            children: null,
          },
          {
            label: '兴安县',
            value: '450325',
            children: null,
          },
          {
            label: '永福县',
            value: '450326',
            children: null,
          },
          {
            label: '灌阳县',
            value: '450327',
            children: null,
          },
          {
            label: '龙胜各族自治县',
            value: '450328',
            children: null,
          },
          {
            label: '资源县',
            value: '450329',
            children: null,
          },
          {
            label: '平乐县',
            value: '450330',
            children: null,
          },
          {
            label: '恭城瑶族自治县',
            value: '450332',
            children: null,
          },
          {
            label: '荔浦市',
            value: '450381',
            children: null,
          },
        ],
      },
      {
        label: '梧州市',
        value: '450400',
        children: [
          {
            label: '万秀区',
            value: '450403',
            children: null,
          },
          {
            label: '长洲区',
            value: '450405',
            children: null,
          },
          {
            label: '龙圩区',
            value: '450406',
            children: null,
          },
          {
            label: '苍梧县',
            value: '450421',
            children: null,
          },
          {
            label: '藤县',
            value: '450422',
            children: null,
          },
          {
            label: '蒙山县',
            value: '450423',
            children: null,
          },
          {
            label: '岑溪市',
            value: '450481',
            children: null,
          },
        ],
      },
      {
        label: '北海市',
        value: '450500',
        children: [
          {
            label: '海城区',
            value: '450502',
            children: null,
          },
          {
            label: '银海区',
            value: '450503',
            children: null,
          },
          {
            label: '铁山港区',
            value: '450512',
            children: null,
          },
          {
            label: '合浦县',
            value: '450521',
            children: null,
          },
        ],
      },
      {
        label: '防城港市',
        value: '450600',
        children: [
          {
            label: '港口区',
            value: '450602',
            children: null,
          },
          {
            label: '防城区',
            value: '450603',
            children: null,
          },
          {
            label: '上思县',
            value: '450621',
            children: null,
          },
          {
            label: '东兴市',
            value: '450681',
            children: null,
          },
        ],
      },
      {
        label: '钦州市',
        value: '450700',
        children: [
          {
            label: '钦南区',
            value: '450702',
            children: null,
          },
          {
            label: '钦北区',
            value: '450703',
            children: null,
          },
          {
            label: '灵山县',
            value: '450721',
            children: null,
          },
          {
            label: '浦北县',
            value: '450722',
            children: null,
          },
        ],
      },
      {
        label: '贵港市',
        value: '450800',
        children: [
          {
            label: '港北区',
            value: '450802',
            children: null,
          },
          {
            label: '港南区',
            value: '450803',
            children: null,
          },
          {
            label: '覃塘区',
            value: '450804',
            children: null,
          },
          {
            label: '平南县',
            value: '450821',
            children: null,
          },
          {
            label: '桂平市',
            value: '450881',
            children: null,
          },
        ],
      },
      {
        label: '玉林市',
        value: '450900',
        children: [
          {
            label: '玉州区',
            value: '450902',
            children: null,
          },
          {
            label: '福绵区',
            value: '450903',
            children: null,
          },
          {
            label: '容县',
            value: '450921',
            children: null,
          },
          {
            label: '陆川县',
            value: '450922',
            children: null,
          },
          {
            label: '博白县',
            value: '450923',
            children: null,
          },
          {
            label: '兴业县',
            value: '450924',
            children: null,
          },
          {
            label: '北流市',
            value: '450981',
            children: null,
          },
        ],
      },
      {
        label: '百色市',
        value: '451000',
        children: [
          {
            label: '右江区',
            value: '451002',
            children: null,
          },
          {
            label: '田阳县',
            value: '451021',
            children: null,
          },
          {
            label: '田东县',
            value: '451022',
            children: null,
          },
          {
            label: '平果县',
            value: '451023',
            children: null,
          },
          {
            label: '德保县',
            value: '451024',
            children: null,
          },
          {
            label: '那坡县',
            value: '451026',
            children: null,
          },
          {
            label: '凌云县',
            value: '451027',
            children: null,
          },
          {
            label: '乐业县',
            value: '451028',
            children: null,
          },
          {
            label: '田林县',
            value: '451029',
            children: null,
          },
          {
            label: '西林县',
            value: '451030',
            children: null,
          },
          {
            label: '隆林各族自治县',
            value: '451031',
            children: null,
          },
          {
            label: '靖西市',
            value: '451081',
            children: null,
          },
        ],
      },
      {
        label: '贺州市',
        value: '451100',
        children: [
          {
            label: '八步区',
            value: '451102',
            children: null,
          },
          {
            label: '平桂区',
            value: '451103',
            children: null,
          },
          {
            label: '昭平县',
            value: '451121',
            children: null,
          },
          {
            label: '钟山县',
            value: '451122',
            children: null,
          },
          {
            label: '富川瑶族自治县',
            value: '451123',
            children: null,
          },
        ],
      },
      {
        label: '河池市',
        value: '451200',
        children: [
          {
            label: '金城江区',
            value: '451202',
            children: null,
          },
          {
            label: '宜州区',
            value: '451203',
            children: null,
          },
          {
            label: '南丹县',
            value: '451221',
            children: null,
          },
          {
            label: '天峨县',
            value: '451222',
            children: null,
          },
          {
            label: '凤山县',
            value: '451223',
            children: null,
          },
          {
            label: '东兰县',
            value: '451224',
            children: null,
          },
          {
            label: '罗城仫佬族自治县',
            value: '451225',
            children: null,
          },
          {
            label: '环江毛南族自治县',
            value: '451226',
            children: null,
          },
          {
            label: '巴马瑶族自治县',
            value: '451227',
            children: null,
          },
          {
            label: '都安瑶族自治县',
            value: '451228',
            children: null,
          },
          {
            label: '大化瑶族自治县',
            value: '451229',
            children: null,
          },
        ],
      },
      {
        label: '来宾市',
        value: '451300',
        children: [
          {
            label: '兴宾区',
            value: '451302',
            children: null,
          },
          {
            label: '忻城县',
            value: '451321',
            children: null,
          },
          {
            label: '象州县',
            value: '451322',
            children: null,
          },
          {
            label: '武宣县',
            value: '451323',
            children: null,
          },
          {
            label: '金秀瑶族自治县',
            value: '451324',
            children: null,
          },
          {
            label: '合山市',
            value: '451381',
            children: null,
          },
        ],
      },
      {
        label: '崇左市',
        value: '451400',
        children: [
          {
            label: '江州区',
            value: '451402',
            children: null,
          },
          {
            label: '扶绥县',
            value: '451421',
            children: null,
          },
          {
            label: '宁明县',
            value: '451422',
            children: null,
          },
          {
            label: '龙州县',
            value: '451423',
            children: null,
          },
          {
            label: '大新县',
            value: '451424',
            children: null,
          },
          {
            label: '天等县',
            value: '451425',
            children: null,
          },
          {
            label: '凭祥市',
            value: '451481',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '海南省',
    value: '460000',
    children: [
      {
        label: '海口市',
        value: '460100',
        children: [
          {
            label: '秀英区',
            value: '460105',
            children: null,
          },
          {
            label: '龙华区',
            value: '460106',
            children: null,
          },
          {
            label: '琼山区',
            value: '460107',
            children: null,
          },
          {
            label: '美兰区',
            value: '460108',
            children: null,
          },
        ],
      },
      {
        label: '三亚市',
        value: '460200',
        children: [
          {
            label: '海棠区',
            value: '460202',
            children: null,
          },
          {
            label: '吉阳区',
            value: '460203',
            children: null,
          },
          {
            label: '天涯区',
            value: '460204',
            children: null,
          },
          {
            label: '崖州区',
            value: '460205',
            children: null,
          },
        ],
      },
      {
        label: '三沙市',
        value: '460300',
        children: [
          {
            label: '西沙群岛',
            value: '460321',
            children: null,
          },
          {
            label: '南沙群岛',
            value: '460322',
            children: null,
          },
          {
            label: '中沙群岛的岛礁及其海域',
            value: '460323',
            children: null,
          },
        ],
      },
      {
        label: '儋州市',
        value: '460400',
        children: [
          {
            label: '儋州市',
            value: '460499',
            children: null,
          },
        ],
      },
      {
        label: '五指山市',
        value: '469001',
        children: [
          {
            label: '通什镇',
            value: '469001100',
            children: null,
          },
          {
            label: '南圣镇',
            value: '469001101',
            children: null,
          },
          {
            label: '毛阳镇',
            value: '469001102',
            children: null,
          },
          {
            label: '番阳镇',
            value: '469001103',
            children: null,
          },
          {
            label: '畅好乡',
            value: '469001200',
            children: null,
          },
          {
            label: '毛道乡',
            value: '469001201',
            children: null,
          },
          {
            label: '水满乡',
            value: '469001202',
            children: null,
          },
          {
            label: '国营畅好农场',
            value: '469001400',
            children: null,
          },
        ],
      },
      {
        label: '琼海市',
        value: '469002',
        children: [
          {
            label: '嘉积镇',
            value: '469002100',
            children: null,
          },
          {
            label: '万泉镇',
            value: '469002101',
            children: null,
          },
          {
            label: '石壁镇',
            value: '469002102',
            children: null,
          },
          {
            label: '中原镇',
            value: '469002103',
            children: null,
          },
          {
            label: '博鳌镇',
            value: '469002104',
            children: null,
          },
          {
            label: '阳江镇',
            value: '469002105',
            children: null,
          },
          {
            label: '龙江镇',
            value: '469002106',
            children: null,
          },
          {
            label: '潭门镇',
            value: '469002107',
            children: null,
          },
          {
            label: '塔洋镇',
            value: '469002108',
            children: null,
          },
          {
            label: '长坡镇',
            value: '469002109',
            children: null,
          },
          {
            label: '大路镇',
            value: '469002110',
            children: null,
          },
          {
            label: '会山镇',
            value: '469002111',
            children: null,
          },
          {
            label: '东太农场',
            value: '469002400',
            children: null,
          },
          {
            label: '南俸农场',
            value: '469002401',
            children: null,
          },
          {
            label: '东红农场',
            value: '469002402',
            children: null,
          },
          {
            label: '彬村山华侨农场',
            value: '469002500',
            children: null,
          },
          {
            label: '东平农场',
            value: '469002953',
            children: null,
          },
        ],
      },
      {
        label: '文昌市',
        value: '469005',
        children: [
          {
            label: '文城镇',
            value: '469005100',
            children: null,
          },
          {
            label: '重兴镇',
            value: '469005101',
            children: null,
          },
          {
            label: '蓬莱镇',
            value: '469005102',
            children: null,
          },
          {
            label: '会文镇',
            value: '469005103',
            children: null,
          },
          {
            label: '东路镇',
            value: '469005104',
            children: null,
          },
          {
            label: '潭牛镇',
            value: '469005105',
            children: null,
          },
          {
            label: '东阁镇',
            value: '469005106',
            children: null,
          },
          {
            label: '文教镇',
            value: '469005107',
            children: null,
          },
          {
            label: '东郊镇',
            value: '469005108',
            children: null,
          },
          {
            label: '龙楼镇',
            value: '469005109',
            children: null,
          },
          {
            label: '昌洒镇',
            value: '469005110',
            children: null,
          },
          {
            label: '翁田镇',
            value: '469005111',
            children: null,
          },
          {
            label: '抱罗镇',
            value: '469005112',
            children: null,
          },
          {
            label: '冯坡镇',
            value: '469005113',
            children: null,
          },
          {
            label: '锦山镇',
            value: '469005114',
            children: null,
          },
          {
            label: '铺前镇',
            value: '469005115',
            children: null,
          },
          {
            label: '公坡镇',
            value: '469005116',
            children: null,
          },
          {
            label: '国营南阳农场',
            value: '469005401',
            children: null,
          },
          {
            label: '国营罗豆农场',
            value: '469005402',
            children: null,
          },
        ],
      },
      {
        label: '万宁市',
        value: '469006',
        children: [
          {
            label: '万城镇',
            value: '469006100',
            children: null,
          },
          {
            label: '龙滚镇',
            value: '469006101',
            children: null,
          },
          {
            label: '和乐镇',
            value: '469006102',
            children: null,
          },
          {
            label: '后安镇',
            value: '469006103',
            children: null,
          },
          {
            label: '大茂镇',
            value: '469006104',
            children: null,
          },
          {
            label: '东澳镇',
            value: '469006105',
            children: null,
          },
          {
            label: '礼纪镇',
            value: '469006106',
            children: null,
          },
          {
            label: '长丰镇',
            value: '469006107',
            children: null,
          },
          {
            label: '山根镇',
            value: '469006108',
            children: null,
          },
          {
            label: '北大镇',
            value: '469006109',
            children: null,
          },
          {
            label: '南桥镇',
            value: '469006110',
            children: null,
          },
          {
            label: '三更罗镇',
            value: '469006111',
            children: null,
          },
          {
            label: '国营东兴农场',
            value: '469006400',
            children: null,
          },
          {
            label: '兴隆华侨农场',
            value: '469006500',
            children: null,
          },
          {
            label: '地方国营六连林场',
            value: '469006501',
            children: null,
          },
          {
            label: '东岭农场',
            value: '469006951',
            children: null,
          },
        ],
      },
      {
        label: '东方市',
        value: '469007',
        children: [
          {
            label: '八所镇',
            value: '469007100',
            children: null,
          },
          {
            label: '东河镇',
            value: '469007101',
            children: null,
          },
          {
            label: '大田镇',
            value: '469007102',
            children: null,
          },
          {
            label: '感城镇',
            value: '469007103',
            children: null,
          },
          {
            label: '板桥镇',
            value: '469007104',
            children: null,
          },
          {
            label: '三家镇',
            value: '469007105',
            children: null,
          },
          {
            label: '四更镇',
            value: '469007106',
            children: null,
          },
          {
            label: '新龙镇',
            value: '469007107',
            children: null,
          },
          {
            label: '天安乡',
            value: '469007200',
            children: null,
          },
          {
            label: '江边乡',
            value: '469007201',
            children: null,
          },
          {
            label: '国营广坝农场',
            value: '469007400',
            children: null,
          },
          {
            label: '东方华侨农场',
            value: '469007500',
            children: null,
          },
          {
            label: '东方农场',
            value: '469007950',
            children: null,
          },
        ],
      },
      {
        label: '定安县',
        value: '469021',
        children: [
          {
            label: '定城镇',
            value: '469021100',
            children: null,
          },
          {
            label: '新竹镇',
            value: '469021101',
            children: null,
          },
          {
            label: '龙湖镇',
            value: '469021102',
            children: null,
          },
          {
            label: '黄竹镇',
            value: '469021103',
            children: null,
          },
          {
            label: '雷鸣镇',
            value: '469021104',
            children: null,
          },
          {
            label: '龙门镇',
            value: '469021105',
            children: null,
          },
          {
            label: '龙河镇',
            value: '469021106',
            children: null,
          },
          {
            label: '岭口镇',
            value: '469021107',
            children: null,
          },
          {
            label: '翰林镇',
            value: '469021108',
            children: null,
          },
          {
            label: '富文镇',
            value: '469021109',
            children: null,
          },
          {
            label: '国营中瑞农场',
            value: '469021400',
            children: null,
          },
          {
            label: '国营南海农场',
            value: '469021401',
            children: null,
          },
          {
            label: '国营金鸡岭农场',
            value: '469021402',
            children: null,
          },
          {
            label: '国营东升农场',
            value: '469021403',
            children: null,
          },
        ],
      },
      {
        label: '屯昌县',
        value: '469022',
        children: [
          {
            label: '屯城镇',
            value: '469022100',
            children: null,
          },
          {
            label: '新兴镇',
            value: '469022101',
            children: null,
          },
          {
            label: '枫木镇',
            value: '469022102',
            children: null,
          },
          {
            label: '乌坡镇',
            value: '469022103',
            children: null,
          },
          {
            label: '南吕镇',
            value: '469022104',
            children: null,
          },
          {
            label: '南坤镇',
            value: '469022105',
            children: null,
          },
          {
            label: '坡心镇',
            value: '469022106',
            children: null,
          },
          {
            label: '西昌镇',
            value: '469022107',
            children: null,
          },
          {
            label: '国营中瑞农场',
            value: '469022400',
            children: null,
          },
          {
            label: '国营中坤农场',
            value: '469022401',
            children: null,
          },
          {
            label: '国营中建农场',
            value: '469022950',
            children: null,
          },
          {
            label: '晨星农场',
            value: '469022951',
            children: null,
          },
          {
            label: '黄岭农场',
            value: '469022952',
            children: null,
          },
          {
            label: '广青农场',
            value: '469022954',
            children: null,
          },
        ],
      },
      {
        label: '澄迈县',
        value: '469023',
        children: [
          {
            label: '金江镇',
            value: '469023100',
            children: null,
          },
          {
            label: '老城镇',
            value: '469023101',
            children: null,
          },
          {
            label: '瑞溪镇',
            value: '469023102',
            children: null,
          },
          {
            label: '永发镇',
            value: '469023103',
            children: null,
          },
          {
            label: '加乐镇',
            value: '469023104',
            children: null,
          },
          {
            label: '文儒镇',
            value: '469023105',
            children: null,
          },
          {
            label: '中兴镇',
            value: '469023106',
            children: null,
          },
          {
            label: '仁兴镇',
            value: '469023107',
            children: null,
          },
          {
            label: '福山镇',
            value: '469023108',
            children: null,
          },
          {
            label: '桥头镇',
            value: '469023109',
            children: null,
          },
          {
            label: '大丰镇',
            value: '469023110',
            children: null,
          },
          {
            label: '国营红光农场',
            value: '469023400',
            children: null,
          },
          {
            label: '红岗农场',
            value: '469023401',
            children: null,
          },
          {
            label: '国营西达农场',
            value: '469023402',
            children: null,
          },
          {
            label: '国营金安农场',
            value: '469023405',
            children: null,
          },
        ],
      },
      {
        label: '临高县',
        value: '469024',
        children: [
          {
            label: '临城镇',
            value: '469024100',
            children: null,
          },
          {
            label: '波莲镇',
            value: '469024101',
            children: null,
          },
          {
            label: '东英镇',
            value: '469024102',
            children: null,
          },
          {
            label: '博厚镇',
            value: '469024103',
            children: null,
          },
          {
            label: '皇桐镇',
            value: '469024104',
            children: null,
          },
          {
            label: '多文镇',
            value: '469024105',
            children: null,
          },
          {
            label: '和舍镇',
            value: '469024106',
            children: null,
          },
          {
            label: '南宝镇',
            value: '469024107',
            children: null,
          },
          {
            label: '新盈镇',
            value: '469024108',
            children: null,
          },
          {
            label: '调楼镇',
            value: '469024109',
            children: null,
          },
          {
            label: '国营红华农场',
            value: '469024400',
            children: null,
          },
          {
            label: '国营加来农场',
            value: '469024401',
            children: null,
          },
        ],
      },
      {
        label: '白沙黎族自治县',
        value: '469025',
        children: [
          {
            label: '牙叉镇',
            value: '469025100',
            children: null,
          },
          {
            label: '七坊镇',
            value: '469025101',
            children: null,
          },
          {
            label: '邦溪镇',
            value: '469025102',
            children: null,
          },
          {
            label: '打安镇',
            value: '469025103',
            children: null,
          },
          {
            label: '细水乡',
            value: '469025200',
            children: null,
          },
          {
            label: '元门乡',
            value: '469025201',
            children: null,
          },
          {
            label: '南开乡',
            value: '469025202',
            children: null,
          },
          {
            label: '阜龙乡',
            value: '469025203',
            children: null,
          },
          {
            label: '青松乡',
            value: '469025204',
            children: null,
          },
          {
            label: '金波乡',
            value: '469025205',
            children: null,
          },
          {
            label: '荣邦乡',
            value: '469025206',
            children: null,
          },
          {
            label: '国营白沙农场',
            value: '469025401',
            children: null,
          },
          {
            label: '国营龙江农场',
            value: '469025404',
            children: null,
          },
          {
            label: '卫星农场',
            value: '469025950',
            children: null,
          },
        ],
      },
      {
        label: '昌江黎族自治县',
        value: '469026',
        children: [
          {
            label: '石碌镇',
            value: '469026100',
            children: null,
          },
          {
            label: '叉河镇',
            value: '469026101',
            children: null,
          },
          {
            label: '十月田镇',
            value: '469026102',
            children: null,
          },
          {
            label: '乌烈镇',
            value: '469026103',
            children: null,
          },
          {
            label: '昌化镇',
            value: '469026104',
            children: null,
          },
          {
            label: '海尾镇',
            value: '469026105',
            children: null,
          },
          {
            label: '七叉镇',
            value: '469026106',
            children: null,
          },
          {
            label: '王下乡',
            value: '469026200',
            children: null,
          },
          {
            label: '国营红林农场',
            value: '469026401',
            children: null,
          },
          {
            label: '国营霸王岭林场',
            value: '469026500',
            children: null,
          },
        ],
      },
      {
        label: '乐东黎族自治县',
        value: '469027',
        children: [
          {
            label: '抱由镇',
            value: '469027100',
            children: null,
          },
          {
            label: '万冲镇',
            value: '469027101',
            children: null,
          },
          {
            label: '大安镇',
            value: '469027102',
            children: null,
          },
          {
            label: '志仲镇',
            value: '469027103',
            children: null,
          },
          {
            label: '千家镇',
            value: '469027104',
            children: null,
          },
          {
            label: '九所镇',
            value: '469027105',
            children: null,
          },
          {
            label: '利国镇',
            value: '469027106',
            children: null,
          },
          {
            label: '黄流镇',
            value: '469027107',
            children: null,
          },
          {
            label: '佛罗镇',
            value: '469027108',
            children: null,
          },
          {
            label: '尖峰镇',
            value: '469027109',
            children: null,
          },
          {
            label: '莺歌海镇',
            value: '469027110',
            children: null,
          },
          {
            label: '国营山荣农场',
            value: '469027401',
            children: null,
          },
          {
            label: '国营乐光农场',
            value: '469027402',
            children: null,
          },
          {
            label: '国营保国农场',
            value: '469027405',
            children: null,
          },
          {
            label: '福报农场',
            value: '469027951',
            children: null,
          },
        ],
      },
      {
        label: '陵水黎族自治县',
        value: '469028',
        children: [
          {
            label: '椰林镇',
            value: '469028100',
            children: null,
          },
          {
            label: '光坡镇',
            value: '469028101',
            children: null,
          },
          {
            label: '三才镇',
            value: '469028102',
            children: null,
          },
          {
            label: '英州镇',
            value: '469028103',
            children: null,
          },
          {
            label: '隆广镇',
            value: '469028104',
            children: null,
          },
          {
            label: '文罗镇',
            value: '469028105',
            children: null,
          },
          {
            label: '本号镇',
            value: '469028106',
            children: null,
          },
          {
            label: '新村镇',
            value: '469028107',
            children: null,
          },
          {
            label: '黎安镇',
            value: '469028108',
            children: null,
          },
          {
            label: '提蒙乡',
            value: '469028200',
            children: null,
          },
          {
            label: '群英乡',
            value: '469028201',
            children: null,
          },
          {
            label: '岭门农场',
            value: '469028400',
            children: null,
          },
          {
            label: '国营南平农场',
            value: '469028401',
            children: null,
          },
        ],
      },
      {
        label: '保亭黎族苗族自治县',
        value: '469029',
        children: [
          {
            label: '保城镇',
            value: '469029100',
            children: null,
          },
          {
            label: '什玲镇',
            value: '469029101',
            children: null,
          },
          {
            label: '加茂镇',
            value: '469029102',
            children: null,
          },
          {
            label: '响水镇',
            value: '469029103',
            children: null,
          },
          {
            label: '新政镇',
            value: '469029104',
            children: null,
          },
          {
            label: '三道镇',
            value: '469029105',
            children: null,
          },
          {
            label: '六弓乡',
            value: '469029200',
            children: null,
          },
          {
            label: '南林乡',
            value: '469029201',
            children: null,
          },
          {
            label: '毛感乡',
            value: '469029202',
            children: null,
          },
          {
            label: '新星农场',
            value: '469029401',
            children: null,
          },
          {
            label: '海南保亭热带作物研究所',
            value: '469029402',
            children: null,
          },
          {
            label: '国营金江农场',
            value: '469029403',
            children: null,
          },
          {
            label: '南茂农场',
            value: '469029950',
            children: null,
          },
          {
            label: '通什茶场',
            value: '469029952',
            children: null,
          },
        ],
      },
      {
        label: '琼中黎族苗族自治县',
        value: '469030',
        children: [
          {
            label: '营根镇',
            value: '469030100',
            children: null,
          },
          {
            label: '湾岭镇',
            value: '469030101',
            children: null,
          },
          {
            label: '黎母山镇',
            value: '469030102',
            children: null,
          },
          {
            label: '和平镇',
            value: '469030103',
            children: null,
          },
          {
            label: '长征镇',
            value: '469030104',
            children: null,
          },
          {
            label: '红毛镇',
            value: '469030105',
            children: null,
          },
          {
            label: '中平镇',
            value: '469030106',
            children: null,
          },
          {
            label: '吊罗山乡',
            value: '469030200',
            children: null,
          },
          {
            label: '上安乡',
            value: '469030201',
            children: null,
          },
          {
            label: '什运乡',
            value: '469030202',
            children: null,
          },
          {
            label: '阳江农场',
            value: '469030402',
            children: null,
          },
          {
            label: '乌石农场',
            value: '469030403',
            children: null,
          },
          {
            label: '岭头茶场',
            value: '469030950',
            children: null,
          },
          {
            label: '南方农场',
            value: '469030951',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '重庆市',
    value: '500000',
    children: [
      {
        label: '重庆市',
        value: '500100',
        children: [
          {
            label: '万州区',
            value: '500101',
            children: null,
          },
          {
            label: '涪陵区',
            value: '500102',
            children: null,
          },
          {
            label: '渝中区',
            value: '500103',
            children: null,
          },
          {
            label: '大渡口区',
            value: '500104',
            children: null,
          },
          {
            label: '江北区',
            value: '500105',
            children: null,
          },
          {
            label: '沙坪坝区',
            value: '500106',
            children: null,
          },
          {
            label: '九龙坡区',
            value: '500107',
            children: null,
          },
          {
            label: '南岸区',
            value: '500108',
            children: null,
          },
          {
            label: '北碚区',
            value: '500109',
            children: null,
          },
          {
            label: '綦江区',
            value: '500110',
            children: null,
          },
          {
            label: '大足区',
            value: '500111',
            children: null,
          },
          {
            label: '渝北区',
            value: '500112',
            children: null,
          },
          {
            label: '巴南区',
            value: '500113',
            children: null,
          },
          {
            label: '黔江区',
            value: '500114',
            children: null,
          },
          {
            label: '长寿区',
            value: '500115',
            children: null,
          },
          {
            label: '江津区',
            value: '500116',
            children: null,
          },
          {
            label: '合川区',
            value: '500117',
            children: null,
          },
          {
            label: '永川区',
            value: '500118',
            children: null,
          },
          {
            label: '南川区',
            value: '500119',
            children: null,
          },
          {
            label: '璧山区',
            value: '500120',
            children: null,
          },
          {
            label: '铜梁区',
            value: '500151',
            children: null,
          },
          {
            label: '潼南区',
            value: '500152',
            children: null,
          },
          {
            label: '荣昌区',
            value: '500153',
            children: null,
          },
          {
            label: '开州区',
            value: '500154',
            children: null,
          },
          {
            label: '梁平区',
            value: '500155',
            children: null,
          },
          {
            label: '武隆区',
            value: '500156',
            children: null,
          },
          {
            label: '城口县',
            value: '500229',
            children: null,
          },
          {
            label: '丰都县',
            value: '500230',
            children: null,
          },
          {
            label: '垫江县',
            value: '500231',
            children: null,
          },
          {
            label: '忠县',
            value: '500233',
            children: null,
          },
          {
            label: '云阳县',
            value: '500235',
            children: null,
          },
          {
            label: '奉节县',
            value: '500236',
            children: null,
          },
          {
            label: '巫山县',
            value: '500237',
            children: null,
          },
          {
            label: '巫溪县',
            value: '500238',
            children: null,
          },
          {
            label: '石柱土家族自治县',
            value: '500240',
            children: null,
          },
          {
            label: '秀山土家族苗族自治县',
            value: '500241',
            children: null,
          },
          {
            label: '酉阳土家族苗族自治县',
            value: '500242',
            children: null,
          },
          {
            label: '彭水苗族土家族自治县',
            value: '500243',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '四川省',
    value: '510000',
    children: [
      {
        label: '成都市',
        value: '510100',
        children: [
          {
            label: '锦江区',
            value: '510104',
            children: null,
          },
          {
            label: '青羊区',
            value: '510105',
            children: null,
          },
          {
            label: '金牛区',
            value: '510106',
            children: null,
          },
          {
            label: '武侯区',
            value: '510107',
            children: null,
          },
          {
            label: '成华区',
            value: '510108',
            children: null,
          },
          {
            label: '龙泉驿区',
            value: '510112',
            children: null,
          },
          {
            label: '青白江区',
            value: '510113',
            children: null,
          },
          {
            label: '新都区',
            value: '510114',
            children: null,
          },
          {
            label: '温江区',
            value: '510115',
            children: null,
          },
          {
            label: '双流区',
            value: '510116',
            children: null,
          },
          {
            label: '郫都区',
            value: '510117',
            children: null,
          },
          {
            label: '金堂县',
            value: '510121',
            children: null,
          },
          {
            label: '大邑县',
            value: '510129',
            children: null,
          },
          {
            label: '蒲江县',
            value: '510131',
            children: null,
          },
          {
            label: '新津县',
            value: '510132',
            children: null,
          },
          {
            label: '都江堰市',
            value: '510181',
            children: null,
          },
          {
            label: '彭州市',
            value: '510182',
            children: null,
          },
          {
            label: '邛崃市',
            value: '510183',
            children: null,
          },
          {
            label: '崇州市',
            value: '510184',
            children: null,
          },
          {
            label: '简阳市',
            value: '510185',
            children: null,
          },
        ],
      },
      {
        label: '自贡市',
        value: '510300',
        children: [
          {
            label: '自流井区',
            value: '510302',
            children: null,
          },
          {
            label: '贡井区',
            value: '510303',
            children: null,
          },
          {
            label: '大安区',
            value: '510304',
            children: null,
          },
          {
            label: '沿滩区',
            value: '510311',
            children: null,
          },
          {
            label: '荣县',
            value: '510321',
            children: null,
          },
          {
            label: '富顺县',
            value: '510322',
            children: null,
          },
        ],
      },
      {
        label: '攀枝花市',
        value: '510400',
        children: [
          {
            label: '东区',
            value: '510402',
            children: null,
          },
          {
            label: '西区',
            value: '510403',
            children: null,
          },
          {
            label: '仁和区',
            value: '510411',
            children: null,
          },
          {
            label: '米易县',
            value: '510421',
            children: null,
          },
          {
            label: '盐边县',
            value: '510422',
            children: null,
          },
        ],
      },
      {
        label: '泸州市',
        value: '510500',
        children: [
          {
            label: '江阳区',
            value: '510502',
            children: null,
          },
          {
            label: '纳溪区',
            value: '510503',
            children: null,
          },
          {
            label: '龙马潭区',
            value: '510504',
            children: null,
          },
          {
            label: '泸县',
            value: '510521',
            children: null,
          },
          {
            label: '合江县',
            value: '510522',
            children: null,
          },
          {
            label: '叙永县',
            value: '510524',
            children: null,
          },
          {
            label: '古蔺县',
            value: '510525',
            children: null,
          },
        ],
      },
      {
        label: '德阳市',
        value: '510600',
        children: [
          {
            label: '旌阳区',
            value: '510603',
            children: null,
          },
          {
            label: '罗江区',
            value: '510604',
            children: null,
          },
          {
            label: '中江县',
            value: '510623',
            children: null,
          },
          {
            label: '广汉市',
            value: '510681',
            children: null,
          },
          {
            label: '什邡市',
            value: '510682',
            children: null,
          },
          {
            label: '绵竹市',
            value: '510683',
            children: null,
          },
        ],
      },
      {
        label: '绵阳市',
        value: '510700',
        children: [
          {
            label: '涪城区',
            value: '510703',
            children: null,
          },
          {
            label: '游仙区',
            value: '510704',
            children: null,
          },
          {
            label: '安州区',
            value: '510705',
            children: null,
          },
          {
            label: '三台县',
            value: '510722',
            children: null,
          },
          {
            label: '盐亭县',
            value: '510723',
            children: null,
          },
          {
            label: '梓潼县',
            value: '510725',
            children: null,
          },
          {
            label: '北川羌族自治县',
            value: '510726',
            children: null,
          },
          {
            label: '平武县',
            value: '510727',
            children: null,
          },
          {
            label: '江油市',
            value: '510781',
            children: null,
          },
        ],
      },
      {
        label: '广元市',
        value: '510800',
        children: [
          {
            label: '利州区',
            value: '510802',
            children: null,
          },
          {
            label: '昭化区',
            value: '510811',
            children: null,
          },
          {
            label: '朝天区',
            value: '510812',
            children: null,
          },
          {
            label: '旺苍县',
            value: '510821',
            children: null,
          },
          {
            label: '青川县',
            value: '510822',
            children: null,
          },
          {
            label: '剑阁县',
            value: '510823',
            children: null,
          },
          {
            label: '苍溪县',
            value: '510824',
            children: null,
          },
        ],
      },
      {
        label: '遂宁市',
        value: '510900',
        children: [
          {
            label: '船山区',
            value: '510903',
            children: null,
          },
          {
            label: '安居区',
            value: '510904',
            children: null,
          },
          {
            label: '蓬溪县',
            value: '510921',
            children: null,
          },
          {
            label: '射洪县',
            value: '510922',
            children: null,
          },
          {
            label: '大英县',
            value: '510923',
            children: null,
          },
        ],
      },
      {
        label: '内江市',
        value: '511000',
        children: [
          {
            label: '市中区',
            value: '511002',
            children: null,
          },
          {
            label: '东兴区',
            value: '511011',
            children: null,
          },
          {
            label: '威远县',
            value: '511024',
            children: null,
          },
          {
            label: '资中县',
            value: '511025',
            children: null,
          },
          {
            label: '隆昌市',
            value: '511083',
            children: null,
          },
        ],
      },
      {
        label: '乐山市',
        value: '511100',
        children: [
          {
            label: '市中区',
            value: '511102',
            children: null,
          },
          {
            label: '沙湾区',
            value: '511111',
            children: null,
          },
          {
            label: '五通桥区',
            value: '511112',
            children: null,
          },
          {
            label: '金口河区',
            value: '511113',
            children: null,
          },
          {
            label: '犍为县',
            value: '511123',
            children: null,
          },
          {
            label: '井研县',
            value: '511124',
            children: null,
          },
          {
            label: '夹江县',
            value: '511126',
            children: null,
          },
          {
            label: '沐川县',
            value: '511129',
            children: null,
          },
          {
            label: '峨边彝族自治县',
            value: '511132',
            children: null,
          },
          {
            label: '马边彝族自治县',
            value: '511133',
            children: null,
          },
          {
            label: '峨眉山市',
            value: '511181',
            children: null,
          },
        ],
      },
      {
        label: '南充市',
        value: '511300',
        children: [
          {
            label: '顺庆区',
            value: '511302',
            children: null,
          },
          {
            label: '高坪区',
            value: '511303',
            children: null,
          },
          {
            label: '嘉陵区',
            value: '511304',
            children: null,
          },
          {
            label: '南部县',
            value: '511321',
            children: null,
          },
          {
            label: '营山县',
            value: '511322',
            children: null,
          },
          {
            label: '蓬安县',
            value: '511323',
            children: null,
          },
          {
            label: '仪陇县',
            value: '511324',
            children: null,
          },
          {
            label: '西充县',
            value: '511325',
            children: null,
          },
          {
            label: '阆中市',
            value: '511381',
            children: null,
          },
        ],
      },
      {
        label: '眉山市',
        value: '511400',
        children: [
          {
            label: '东坡区',
            value: '511402',
            children: null,
          },
          {
            label: '彭山区',
            value: '511403',
            children: null,
          },
          {
            label: '仁寿县',
            value: '511421',
            children: null,
          },
          {
            label: '洪雅县',
            value: '511423',
            children: null,
          },
          {
            label: '丹棱县',
            value: '511424',
            children: null,
          },
          {
            label: '青神县',
            value: '511425',
            children: null,
          },
        ],
      },
      {
        label: '宜宾市',
        value: '511500',
        children: [
          {
            label: '翠屏区',
            value: '511502',
            children: null,
          },
          {
            label: '南溪区',
            value: '511503',
            children: null,
          },
          {
            label: '叙州区',
            value: '511504',
            children: null,
          },
          {
            label: '江安县',
            value: '511523',
            children: null,
          },
          {
            label: '长宁县',
            value: '511524',
            children: null,
          },
          {
            label: '高县',
            value: '511525',
            children: null,
          },
          {
            label: '珙县',
            value: '511526',
            children: null,
          },
          {
            label: '筠连县',
            value: '511527',
            children: null,
          },
          {
            label: '兴文县',
            value: '511528',
            children: null,
          },
          {
            label: '屏山县',
            value: '511529',
            children: null,
          },
        ],
      },
      {
        label: '广安市',
        value: '511600',
        children: [
          {
            label: '广安区',
            value: '511602',
            children: null,
          },
          {
            label: '前锋区',
            value: '511603',
            children: null,
          },
          {
            label: '岳池县',
            value: '511621',
            children: null,
          },
          {
            label: '武胜县',
            value: '511622',
            children: null,
          },
          {
            label: '邻水县',
            value: '511623',
            children: null,
          },
          {
            label: '华蓥市',
            value: '511681',
            children: null,
          },
        ],
      },
      {
        label: '达州市',
        value: '511700',
        children: [
          {
            label: '通川区',
            value: '511702',
            children: null,
          },
          {
            label: '达川区',
            value: '511703',
            children: null,
          },
          {
            label: '宣汉县',
            value: '511722',
            children: null,
          },
          {
            label: '开江县',
            value: '511723',
            children: null,
          },
          {
            label: '大竹县',
            value: '511724',
            children: null,
          },
          {
            label: '渠县',
            value: '511725',
            children: null,
          },
          {
            label: '万源市',
            value: '511781',
            children: null,
          },
        ],
      },
      {
        label: '雅安市',
        value: '511800',
        children: [
          {
            label: '雨城区',
            value: '511802',
            children: null,
          },
          {
            label: '名山区',
            value: '511803',
            children: null,
          },
          {
            label: '荥经县',
            value: '511822',
            children: null,
          },
          {
            label: '汉源县',
            value: '511823',
            children: null,
          },
          {
            label: '石棉县',
            value: '511824',
            children: null,
          },
          {
            label: '天全县',
            value: '511825',
            children: null,
          },
          {
            label: '芦山县',
            value: '511826',
            children: null,
          },
          {
            label: '宝兴县',
            value: '511827',
            children: null,
          },
        ],
      },
      {
        label: '巴中市',
        value: '511900',
        children: [
          {
            label: '巴州区',
            value: '511902',
            children: null,
          },
          {
            label: '恩阳区',
            value: '511903',
            children: null,
          },
          {
            label: '通江县',
            value: '511921',
            children: null,
          },
          {
            label: '南江县',
            value: '511922',
            children: null,
          },
          {
            label: '平昌县',
            value: '511923',
            children: null,
          },
        ],
      },
      {
        label: '资阳市',
        value: '512000',
        children: [
          {
            label: '雁江区',
            value: '512002',
            children: null,
          },
          {
            label: '安岳县',
            value: '512021',
            children: null,
          },
          {
            label: '乐至县',
            value: '512022',
            children: null,
          },
        ],
      },
      {
        label: '阿坝藏族羌族自治州',
        value: '513200',
        children: [
          {
            label: '马尔康市',
            value: '513201',
            children: null,
          },
          {
            label: '汶川县',
            value: '513221',
            children: null,
          },
          {
            label: '理县',
            value: '513222',
            children: null,
          },
          {
            label: '茂县',
            value: '513223',
            children: null,
          },
          {
            label: '松潘县',
            value: '513224',
            children: null,
          },
          {
            label: '九寨沟县',
            value: '513225',
            children: null,
          },
          {
            label: '金川县',
            value: '513226',
            children: null,
          },
          {
            label: '小金县',
            value: '513227',
            children: null,
          },
          {
            label: '黑水县',
            value: '513228',
            children: null,
          },
          {
            label: '壤塘县',
            value: '513230',
            children: null,
          },
          {
            label: '阿坝县',
            value: '513231',
            children: null,
          },
          {
            label: '若尔盖县',
            value: '513232',
            children: null,
          },
          {
            label: '红原县',
            value: '513233',
            children: null,
          },
        ],
      },
      {
        label: '甘孜藏族自治州',
        value: '513300',
        children: [
          {
            label: '康定市',
            value: '513301',
            children: null,
          },
          {
            label: '泸定县',
            value: '513322',
            children: null,
          },
          {
            label: '丹巴县',
            value: '513323',
            children: null,
          },
          {
            label: '九龙县',
            value: '513324',
            children: null,
          },
          {
            label: '雅江县',
            value: '513325',
            children: null,
          },
          {
            label: '道孚县',
            value: '513326',
            children: null,
          },
          {
            label: '炉霍县',
            value: '513327',
            children: null,
          },
          {
            label: '甘孜县',
            value: '513328',
            children: null,
          },
          {
            label: '新龙县',
            value: '513329',
            children: null,
          },
          {
            label: '德格县',
            value: '513330',
            children: null,
          },
          {
            label: '白玉县',
            value: '513331',
            children: null,
          },
          {
            label: '石渠县',
            value: '513332',
            children: null,
          },
          {
            label: '色达县',
            value: '513333',
            children: null,
          },
          {
            label: '理塘县',
            value: '513334',
            children: null,
          },
          {
            label: '巴塘县',
            value: '513335',
            children: null,
          },
          {
            label: '乡城县',
            value: '513336',
            children: null,
          },
          {
            label: '稻城县',
            value: '513337',
            children: null,
          },
          {
            label: '得荣县',
            value: '513338',
            children: null,
          },
        ],
      },
      {
        label: '凉山彝族自治州',
        value: '513400',
        children: [
          {
            label: '西昌市',
            value: '513401',
            children: null,
          },
          {
            label: '木里藏族自治县',
            value: '513422',
            children: null,
          },
          {
            label: '盐源县',
            value: '513423',
            children: null,
          },
          {
            label: '德昌县',
            value: '513424',
            children: null,
          },
          {
            label: '会理县',
            value: '513425',
            children: null,
          },
          {
            label: '会东县',
            value: '513426',
            children: null,
          },
          {
            label: '宁南县',
            value: '513427',
            children: null,
          },
          {
            label: '普格县',
            value: '513428',
            children: null,
          },
          {
            label: '布拖县',
            value: '513429',
            children: null,
          },
          {
            label: '金阳县',
            value: '513430',
            children: null,
          },
          {
            label: '昭觉县',
            value: '513431',
            children: null,
          },
          {
            label: '喜德县',
            value: '513432',
            children: null,
          },
          {
            label: '冕宁县',
            value: '513433',
            children: null,
          },
          {
            label: '越西县',
            value: '513434',
            children: null,
          },
          {
            label: '甘洛县',
            value: '513435',
            children: null,
          },
          {
            label: '美姑县',
            value: '513436',
            children: null,
          },
          {
            label: '雷波县',
            value: '513437',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '贵州省',
    value: '520000',
    children: [
      {
        label: '贵阳市',
        value: '520100',
        children: [
          {
            label: '南明区',
            value: '520102',
            children: null,
          },
          {
            label: '云岩区',
            value: '520103',
            children: null,
          },
          {
            label: '花溪区',
            value: '520111',
            children: null,
          },
          {
            label: '乌当区',
            value: '520112',
            children: null,
          },
          {
            label: '白云区',
            value: '520113',
            children: null,
          },
          {
            label: '观山湖区',
            value: '520115',
            children: null,
          },
          {
            label: '开阳县',
            value: '520121',
            children: null,
          },
          {
            label: '息烽县',
            value: '520122',
            children: null,
          },
          {
            label: '修文县',
            value: '520123',
            children: null,
          },
          {
            label: '清镇市',
            value: '520181',
            children: null,
          },
        ],
      },
      {
        label: '六盘水市',
        value: '520200',
        children: [
          {
            label: '钟山区',
            value: '520201',
            children: null,
          },
          {
            label: '六枝特区',
            value: '520203',
            children: null,
          },
          {
            label: '水城县',
            value: '520221',
            children: null,
          },
          {
            label: '盘州市',
            value: '520281',
            children: null,
          },
        ],
      },
      {
        label: '遵义市',
        value: '520300',
        children: [
          {
            label: '红花岗区',
            value: '520302',
            children: null,
          },
          {
            label: '汇川区',
            value: '520303',
            children: null,
          },
          {
            label: '播州区',
            value: '520304',
            children: null,
          },
          {
            label: '桐梓县',
            value: '520322',
            children: null,
          },
          {
            label: '绥阳县',
            value: '520323',
            children: null,
          },
          {
            label: '正安县',
            value: '520324',
            children: null,
          },
          {
            label: '道真仡佬族苗族自治县',
            value: '520325',
            children: null,
          },
          {
            label: '务川仡佬族苗族自治县',
            value: '520326',
            children: null,
          },
          {
            label: '凤冈县',
            value: '520327',
            children: null,
          },
          {
            label: '湄潭县',
            value: '520328',
            children: null,
          },
          {
            label: '余庆县',
            value: '520329',
            children: null,
          },
          {
            label: '习水县',
            value: '520330',
            children: null,
          },
          {
            label: '赤水市',
            value: '520381',
            children: null,
          },
          {
            label: '仁怀市',
            value: '520382',
            children: null,
          },
        ],
      },
      {
        label: '安顺市',
        value: '520400',
        children: [
          {
            label: '西秀区',
            value: '520402',
            children: null,
          },
          {
            label: '平坝区',
            value: '520403',
            children: null,
          },
          {
            label: '普定县',
            value: '520422',
            children: null,
          },
          {
            label: '镇宁布依族苗族自治县',
            value: '520423',
            children: null,
          },
          {
            label: '关岭布依族苗族自治县',
            value: '520424',
            children: null,
          },
          {
            label: '紫云苗族布依族自治县',
            value: '520425',
            children: null,
          },
        ],
      },
      {
        label: '毕节市',
        value: '520500',
        children: [
          {
            label: '七星关区',
            value: '520502',
            children: null,
          },
          {
            label: '大方县',
            value: '520521',
            children: null,
          },
          {
            label: '黔西县',
            value: '520522',
            children: null,
          },
          {
            label: '金沙县',
            value: '520523',
            children: null,
          },
          {
            label: '织金县',
            value: '520524',
            children: null,
          },
          {
            label: '纳雍县',
            value: '520525',
            children: null,
          },
          {
            label: '威宁彝族回族苗族自治县',
            value: '520526',
            children: null,
          },
          {
            label: '赫章县',
            value: '520527',
            children: null,
          },
        ],
      },
      {
        label: '铜仁市',
        value: '520600',
        children: [
          {
            label: '碧江区',
            value: '520602',
            children: null,
          },
          {
            label: '万山区',
            value: '520603',
            children: null,
          },
          {
            label: '江口县',
            value: '520621',
            children: null,
          },
          {
            label: '玉屏侗族自治县',
            value: '520622',
            children: null,
          },
          {
            label: '石阡县',
            value: '520623',
            children: null,
          },
          {
            label: '思南县',
            value: '520624',
            children: null,
          },
          {
            label: '印江土家族苗族自治县',
            value: '520625',
            children: null,
          },
          {
            label: '德江县',
            value: '520626',
            children: null,
          },
          {
            label: '沿河土家族自治县',
            value: '520627',
            children: null,
          },
          {
            label: '松桃苗族自治县',
            value: '520628',
            children: null,
          },
        ],
      },
      {
        label: '黔西南布依族苗族自治州',
        value: '522300',
        children: [
          {
            label: '兴义市',
            value: '522301',
            children: null,
          },
          {
            label: '兴仁市',
            value: '522302',
            children: null,
          },
          {
            label: '普安县',
            value: '522323',
            children: null,
          },
          {
            label: '晴隆县',
            value: '522324',
            children: null,
          },
          {
            label: '贞丰县',
            value: '522325',
            children: null,
          },
          {
            label: '望谟县',
            value: '522326',
            children: null,
          },
          {
            label: '册亨县',
            value: '522327',
            children: null,
          },
          {
            label: '安龙县',
            value: '522328',
            children: null,
          },
        ],
      },
      {
        label: '黔东南苗族侗族自治州',
        value: '522600',
        children: [
          {
            label: '凯里市',
            value: '522601',
            children: null,
          },
          {
            label: '黄平县',
            value: '522622',
            children: null,
          },
          {
            label: '施秉县',
            value: '522623',
            children: null,
          },
          {
            label: '三穗县',
            value: '522624',
            children: null,
          },
          {
            label: '镇远县',
            value: '522625',
            children: null,
          },
          {
            label: '岑巩县',
            value: '522626',
            children: null,
          },
          {
            label: '天柱县',
            value: '522627',
            children: null,
          },
          {
            label: '锦屏县',
            value: '522628',
            children: null,
          },
          {
            label: '剑河县',
            value: '522629',
            children: null,
          },
          {
            label: '台江县',
            value: '522630',
            children: null,
          },
          {
            label: '黎平县',
            value: '522631',
            children: null,
          },
          {
            label: '榕江县',
            value: '522632',
            children: null,
          },
          {
            label: '从江县',
            value: '522633',
            children: null,
          },
          {
            label: '雷山县',
            value: '522634',
            children: null,
          },
          {
            label: '麻江县',
            value: '522635',
            children: null,
          },
          {
            label: '丹寨县',
            value: '522636',
            children: null,
          },
        ],
      },
      {
        label: '黔南布依族苗族自治州',
        value: '522700',
        children: [
          {
            label: '都匀市',
            value: '522701',
            children: null,
          },
          {
            label: '福泉市',
            value: '522702',
            children: null,
          },
          {
            label: '荔波县',
            value: '522722',
            children: null,
          },
          {
            label: '贵定县',
            value: '522723',
            children: null,
          },
          {
            label: '瓮安县',
            value: '522725',
            children: null,
          },
          {
            label: '独山县',
            value: '522726',
            children: null,
          },
          {
            label: '平塘县',
            value: '522727',
            children: null,
          },
          {
            label: '罗甸县',
            value: '522728',
            children: null,
          },
          {
            label: '长顺县',
            value: '522729',
            children: null,
          },
          {
            label: '龙里县',
            value: '522730',
            children: null,
          },
          {
            label: '惠水县',
            value: '522731',
            children: null,
          },
          {
            label: '三都水族自治县',
            value: '522732',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '云南省',
    value: '530000',
    children: [
      {
        label: '昆明市',
        value: '530100',
        children: [
          {
            label: '五华区',
            value: '530102',
            children: null,
          },
          {
            label: '盘龙区',
            value: '530103',
            children: null,
          },
          {
            label: '官渡区',
            value: '530111',
            children: null,
          },
          {
            label: '西山区',
            value: '530112',
            children: null,
          },
          {
            label: '东川区',
            value: '530113',
            children: null,
          },
          {
            label: '呈贡区',
            value: '530114',
            children: null,
          },
          {
            label: '晋宁区',
            value: '530115',
            children: null,
          },
          {
            label: '富民县',
            value: '530124',
            children: null,
          },
          {
            label: '宜良县',
            value: '530125',
            children: null,
          },
          {
            label: '石林彝族自治县',
            value: '530126',
            children: null,
          },
          {
            label: '嵩明县',
            value: '530127',
            children: null,
          },
          {
            label: '禄劝彝族苗族自治县',
            value: '530128',
            children: null,
          },
          {
            label: '寻甸回族彝族自治县',
            value: '530129',
            children: null,
          },
          {
            label: '安宁市',
            value: '530181',
            children: null,
          },
        ],
      },
      {
        label: '曲靖市',
        value: '530300',
        children: [
          {
            label: '麒麟区',
            value: '530302',
            children: null,
          },
          {
            label: '沾益区',
            value: '530303',
            children: null,
          },
          {
            label: '马龙区',
            value: '530304',
            children: null,
          },
          {
            label: '陆良县',
            value: '530322',
            children: null,
          },
          {
            label: '师宗县',
            value: '530323',
            children: null,
          },
          {
            label: '罗平县',
            value: '530324',
            children: null,
          },
          {
            label: '富源县',
            value: '530325',
            children: null,
          },
          {
            label: '会泽县',
            value: '530326',
            children: null,
          },
          {
            label: '宣威市',
            value: '530381',
            children: null,
          },
        ],
      },
      {
        label: '玉溪市',
        value: '530400',
        children: [
          {
            label: '红塔区',
            value: '530402',
            children: null,
          },
          {
            label: '江川区',
            value: '530403',
            children: null,
          },
          {
            label: '澄江县',
            value: '530422',
            children: null,
          },
          {
            label: '通海县',
            value: '530423',
            children: null,
          },
          {
            label: '华宁县',
            value: '530424',
            children: null,
          },
          {
            label: '易门县',
            value: '530425',
            children: null,
          },
          {
            label: '峨山彝族自治县',
            value: '530426',
            children: null,
          },
          {
            label: '新平彝族傣族自治县',
            value: '530427',
            children: null,
          },
          {
            label: '元江县',
            value: '530428',
            children: null,
          },
        ],
      },
      {
        label: '保山市',
        value: '530500',
        children: [
          {
            label: '隆阳区',
            value: '530502',
            children: null,
          },
          {
            label: '施甸县',
            value: '530521',
            children: null,
          },
          {
            label: '龙陵县',
            value: '530523',
            children: null,
          },
          {
            label: '昌宁县',
            value: '530524',
            children: null,
          },
          {
            label: '腾冲市',
            value: '530581',
            children: null,
          },
        ],
      },
      {
        label: '昭通市',
        value: '530600',
        children: [
          {
            label: '昭阳区',
            value: '530602',
            children: null,
          },
          {
            label: '鲁甸县',
            value: '530621',
            children: null,
          },
          {
            label: '巧家县',
            value: '530622',
            children: null,
          },
          {
            label: '盐津县',
            value: '530623',
            children: null,
          },
          {
            label: '大关县',
            value: '530624',
            children: null,
          },
          {
            label: '永善县',
            value: '530625',
            children: null,
          },
          {
            label: '绥江县',
            value: '530626',
            children: null,
          },
          {
            label: '镇雄县',
            value: '530627',
            children: null,
          },
          {
            label: '彝良县',
            value: '530628',
            children: null,
          },
          {
            label: '威信县',
            value: '530629',
            children: null,
          },
          {
            label: '水富市',
            value: '530681',
            children: null,
          },
        ],
      },
      {
        label: '丽江市',
        value: '530700',
        children: [
          {
            label: '古城区',
            value: '530702',
            children: null,
          },
          {
            label: '玉龙纳西族自治县',
            value: '530721',
            children: null,
          },
          {
            label: '永胜县',
            value: '530722',
            children: null,
          },
          {
            label: '华坪县',
            value: '530723',
            children: null,
          },
          {
            label: '宁蒗彝族自治县',
            value: '530724',
            children: null,
          },
        ],
      },
      {
        label: '普洱市',
        value: '530800',
        children: [
          {
            label: '思茅区',
            value: '530802',
            children: null,
          },
          {
            label: '宁洱哈尼族彝族自治县',
            value: '530821',
            children: null,
          },
          {
            label: '墨江哈尼族自治县',
            value: '530822',
            children: null,
          },
          {
            label: '景东彝族自治县',
            value: '530823',
            children: null,
          },
          {
            label: '景谷傣族彝族自治县',
            value: '530824',
            children: null,
          },
          {
            label: '镇沅县',
            value: '530825',
            children: null,
          },
          {
            label: '江城哈尼族彝族自治县',
            value: '530826',
            children: null,
          },
          {
            label: '孟连县',
            value: '530827',
            children: null,
          },
          {
            label: '澜沧拉祜族自治县',
            value: '530828',
            children: null,
          },
          {
            label: '西盟佤族自治县',
            value: '530829',
            children: null,
          },
        ],
      },
      {
        label: '临沧市',
        value: '530900',
        children: [
          {
            label: '临翔区',
            value: '530902',
            children: null,
          },
          {
            label: '凤庆县',
            value: '530921',
            children: null,
          },
          {
            label: '云县',
            value: '530922',
            children: null,
          },
          {
            label: '永德县',
            value: '530923',
            children: null,
          },
          {
            label: '镇康县',
            value: '530924',
            children: null,
          },
          {
            label: '双江县',
            value: '530925',
            children: null,
          },
          {
            label: '耿马傣族佤族自治县',
            value: '530926',
            children: null,
          },
          {
            label: '沧源佤族自治县',
            value: '530927',
            children: null,
          },
        ],
      },
      {
        label: '楚雄彝族自治州',
        value: '532300',
        children: [
          {
            label: '楚雄市',
            value: '532301',
            children: null,
          },
          {
            label: '双柏县',
            value: '532322',
            children: null,
          },
          {
            label: '牟定县',
            value: '532323',
            children: null,
          },
          {
            label: '南华县',
            value: '532324',
            children: null,
          },
          {
            label: '姚安县',
            value: '532325',
            children: null,
          },
          {
            label: '大姚县',
            value: '532326',
            children: null,
          },
          {
            label: '永仁县',
            value: '532327',
            children: null,
          },
          {
            label: '元谋县',
            value: '532328',
            children: null,
          },
          {
            label: '武定县',
            value: '532329',
            children: null,
          },
          {
            label: '禄丰县',
            value: '532331',
            children: null,
          },
        ],
      },
      {
        label: '红河哈尼族彝族自治州',
        value: '532500',
        children: [
          {
            label: '个旧市',
            value: '532501',
            children: null,
          },
          {
            label: '开远市',
            value: '532502',
            children: null,
          },
          {
            label: '蒙自市',
            value: '532503',
            children: null,
          },
          {
            label: '弥勒市',
            value: '532504',
            children: null,
          },
          {
            label: '屏边苗族自治县',
            value: '532523',
            children: null,
          },
          {
            label: '建水县',
            value: '532524',
            children: null,
          },
          {
            label: '石屏县',
            value: '532525',
            children: null,
          },
          {
            label: '泸西县',
            value: '532527',
            children: null,
          },
          {
            label: '元阳县',
            value: '532528',
            children: null,
          },
          {
            label: '红河县',
            value: '532529',
            children: null,
          },
          {
            label: '金平苗族瑶族傣族自治县',
            value: '532530',
            children: null,
          },
          {
            label: '绿春县',
            value: '532531',
            children: null,
          },
          {
            label: '河口瑶族自治县',
            value: '532532',
            children: null,
          },
        ],
      },
      {
        label: '文山壮族苗族自治州',
        value: '532600',
        children: [
          {
            label: '文山市',
            value: '532601',
            children: null,
          },
          {
            label: '砚山县',
            value: '532622',
            children: null,
          },
          {
            label: '西畴县',
            value: '532623',
            children: null,
          },
          {
            label: '麻栗坡县',
            value: '532624',
            children: null,
          },
          {
            label: '马关县',
            value: '532625',
            children: null,
          },
          {
            label: '丘北县',
            value: '532626',
            children: null,
          },
          {
            label: '广南县',
            value: '532627',
            children: null,
          },
          {
            label: '富宁县',
            value: '532628',
            children: null,
          },
        ],
      },
      {
        label: '西双版纳傣族自治州',
        value: '532800',
        children: [
          {
            label: '景洪市',
            value: '532801',
            children: null,
          },
          {
            label: '勐海县',
            value: '532822',
            children: null,
          },
          {
            label: '勐腊县',
            value: '532823',
            children: null,
          },
        ],
      },
      {
        label: '大理白族自治州',
        value: '532900',
        children: [
          {
            label: '大理市',
            value: '532901',
            children: null,
          },
          {
            label: '漾濞彝族自治县',
            value: '532922',
            children: null,
          },
          {
            label: '祥云县',
            value: '532923',
            children: null,
          },
          {
            label: '宾川县',
            value: '532924',
            children: null,
          },
          {
            label: '弥渡县',
            value: '532925',
            children: null,
          },
          {
            label: '南涧彝族自治县',
            value: '532926',
            children: null,
          },
          {
            label: '巍山彝族回族自治县',
            value: '532927',
            children: null,
          },
          {
            label: '永平县',
            value: '532928',
            children: null,
          },
          {
            label: '云龙县',
            value: '532929',
            children: null,
          },
          {
            label: '洱源县',
            value: '532930',
            children: null,
          },
          {
            label: '剑川县',
            value: '532931',
            children: null,
          },
          {
            label: '鹤庆县',
            value: '532932',
            children: null,
          },
        ],
      },
      {
        label: '德宏傣族景颇族自治州',
        value: '533100',
        children: [
          {
            label: '瑞丽市',
            value: '533102',
            children: null,
          },
          {
            label: '芒市',
            value: '533103',
            children: null,
          },
          {
            label: '梁河县',
            value: '533122',
            children: null,
          },
          {
            label: '盈江县',
            value: '533123',
            children: null,
          },
          {
            label: '陇川县',
            value: '533124',
            children: null,
          },
        ],
      },
      {
        label: '怒江傈僳族自治州',
        value: '533300',
        children: [
          {
            label: '泸水市',
            value: '533301',
            children: null,
          },
          {
            label: '福贡县',
            value: '533323',
            children: null,
          },
          {
            label: '贡山独龙族怒族自治县',
            value: '533324',
            children: null,
          },
          {
            label: '兰坪白族普米族自治县',
            value: '533325',
            children: null,
          },
        ],
      },
      {
        label: '迪庆藏族自治州',
        value: '533400',
        children: [
          {
            label: '香格里拉市',
            value: '533401',
            children: null,
          },
          {
            label: '德钦县',
            value: '533422',
            children: null,
          },
          {
            label: '维西傈僳族自治县',
            value: '533423',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '西藏自治区',
    value: '540000',
    children: [
      {
        label: '拉萨市',
        value: '540100',
        children: [
          {
            label: '城关区',
            value: '540102',
            children: null,
          },
          {
            label: '堆龙德庆区',
            value: '540103',
            children: null,
          },
          {
            label: '达孜区',
            value: '540104',
            children: null,
          },
          {
            label: '林周县',
            value: '540121',
            children: null,
          },
          {
            label: '当雄县',
            value: '540122',
            children: null,
          },
          {
            label: '尼木县',
            value: '540123',
            children: null,
          },
          {
            label: '曲水县',
            value: '540124',
            children: null,
          },
          {
            label: '墨竹工卡县',
            value: '540127',
            children: null,
          },
        ],
      },
      {
        label: '日喀则市',
        value: '540200',
        children: [
          {
            label: '桑珠孜区',
            value: '540202',
            children: null,
          },
          {
            label: '南木林县',
            value: '540221',
            children: null,
          },
          {
            label: '江孜县',
            value: '540222',
            children: null,
          },
          {
            label: '定日县',
            value: '540223',
            children: null,
          },
          {
            label: '萨迦县',
            value: '540224',
            children: null,
          },
          {
            label: '拉孜县',
            value: '540225',
            children: null,
          },
          {
            label: '昂仁县',
            value: '540226',
            children: null,
          },
          {
            label: '谢通门县',
            value: '540227',
            children: null,
          },
          {
            label: '白朗县',
            value: '540228',
            children: null,
          },
          {
            label: '仁布县',
            value: '540229',
            children: null,
          },
          {
            label: '康马县',
            value: '540230',
            children: null,
          },
          {
            label: '定结县',
            value: '540231',
            children: null,
          },
          {
            label: '仲巴县',
            value: '540232',
            children: null,
          },
          {
            label: '亚东县',
            value: '540233',
            children: null,
          },
          {
            label: '吉隆县',
            value: '540234',
            children: null,
          },
          {
            label: '聂拉木县',
            value: '540235',
            children: null,
          },
          {
            label: '萨嘎县',
            value: '540236',
            children: null,
          },
          {
            label: '岗巴县',
            value: '540237',
            children: null,
          },
        ],
      },
      {
        label: '昌都市',
        value: '540300',
        children: [
          {
            label: '卡若区',
            value: '540302',
            children: null,
          },
          {
            label: '江达县',
            value: '540321',
            children: null,
          },
          {
            label: '贡觉县',
            value: '540322',
            children: null,
          },
          {
            label: '类乌齐县',
            value: '540323',
            children: null,
          },
          {
            label: '丁青县',
            value: '540324',
            children: null,
          },
          {
            label: '察雅县',
            value: '540325',
            children: null,
          },
          {
            label: '八宿县',
            value: '540326',
            children: null,
          },
          {
            label: '左贡县',
            value: '540327',
            children: null,
          },
          {
            label: '芒康县',
            value: '540328',
            children: null,
          },
          {
            label: '洛隆县',
            value: '540329',
            children: null,
          },
          {
            label: '边坝县',
            value: '540330',
            children: null,
          },
        ],
      },
      {
        label: '林芝市',
        value: '540400',
        children: [
          {
            label: '巴宜区',
            value: '540402',
            children: null,
          },
          {
            label: '工布江达县',
            value: '540421',
            children: null,
          },
          {
            label: '米林县',
            value: '540422',
            children: null,
          },
          {
            label: '墨脱县',
            value: '540423',
            children: null,
          },
          {
            label: '波密县',
            value: '540424',
            children: null,
          },
          {
            label: '察隅县',
            value: '540425',
            children: null,
          },
          {
            label: '朗县',
            value: '540426',
            children: null,
          },
        ],
      },
      {
        label: '山南市',
        value: '540500',
        children: [
          {
            label: '乃东区',
            value: '540502',
            children: null,
          },
          {
            label: '扎囊县',
            value: '540521',
            children: null,
          },
          {
            label: '贡嘎县',
            value: '540522',
            children: null,
          },
          {
            label: '桑日县',
            value: '540523',
            children: null,
          },
          {
            label: '琼结县',
            value: '540524',
            children: null,
          },
          {
            label: '曲松县',
            value: '540525',
            children: null,
          },
          {
            label: '措美县',
            value: '540526',
            children: null,
          },
          {
            label: '洛扎县',
            value: '540527',
            children: null,
          },
          {
            label: '加查县',
            value: '540528',
            children: null,
          },
          {
            label: '隆子县',
            value: '540529',
            children: null,
          },
          {
            label: '错那县',
            value: '540530',
            children: null,
          },
          {
            label: '浪卡子县',
            value: '540531',
            children: null,
          },
        ],
      },
      {
        label: '那曲市',
        value: '540600',
        children: [
          {
            label: '色尼区',
            value: '540602',
            children: null,
          },
          {
            label: '嘉黎县',
            value: '540621',
            children: null,
          },
          {
            label: '比如县',
            value: '540622',
            children: null,
          },
          {
            label: '聂荣县',
            value: '540623',
            children: null,
          },
          {
            label: '安多县',
            value: '540624',
            children: null,
          },
          {
            label: '申扎县',
            value: '540625',
            children: null,
          },
          {
            label: '索县',
            value: '540626',
            children: null,
          },
          {
            label: '班戈县',
            value: '540627',
            children: null,
          },
          {
            label: '巴青县',
            value: '540628',
            children: null,
          },
          {
            label: '尼玛县',
            value: '540629',
            children: null,
          },
          {
            label: '双湖县',
            value: '540630',
            children: null,
          },
        ],
      },
      {
        label: '阿里地区',
        value: '542500',
        children: [
          {
            label: '普兰县',
            value: '542521',
            children: null,
          },
          {
            label: '札达县',
            value: '542522',
            children: null,
          },
          {
            label: '噶尔县',
            value: '542523',
            children: null,
          },
          {
            label: '日土县',
            value: '542524',
            children: null,
          },
          {
            label: '革吉县',
            value: '542525',
            children: null,
          },
          {
            label: '改则县',
            value: '542526',
            children: null,
          },
          {
            label: '措勤县',
            value: '542527',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '陕西省',
    value: '610000',
    children: [
      {
        label: '西安市',
        value: '610100',
        children: [
          {
            label: '新城区',
            value: '610102',
            children: null,
          },
          {
            label: '碑林区',
            value: '610103',
            children: null,
          },
          {
            label: '莲湖区',
            value: '610104',
            children: null,
          },
          {
            label: '灞桥区',
            value: '610111',
            children: null,
          },
          {
            label: '未央区',
            value: '610112',
            children: null,
          },
          {
            label: '雁塔区',
            value: '610113',
            children: null,
          },
          {
            label: '阎良区',
            value: '610114',
            children: null,
          },
          {
            label: '临潼区',
            value: '610115',
            children: null,
          },
          {
            label: '长安区',
            value: '610116',
            children: null,
          },
          {
            label: '高陵区',
            value: '610117',
            children: null,
          },
          {
            label: '鄠邑区',
            value: '610118',
            children: null,
          },
          {
            label: '蓝田县',
            value: '610122',
            children: null,
          },
          {
            label: '周至县',
            value: '610124',
            children: null,
          },
        ],
      },
      {
        label: '铜川市',
        value: '610200',
        children: [
          {
            label: '王益区',
            value: '610202',
            children: null,
          },
          {
            label: '印台区',
            value: '610203',
            children: null,
          },
          {
            label: '耀州区',
            value: '610204',
            children: null,
          },
          {
            label: '宜君县',
            value: '610222',
            children: null,
          },
        ],
      },
      {
        label: '宝鸡市',
        value: '610300',
        children: [
          {
            label: '渭滨区',
            value: '610302',
            children: null,
          },
          {
            label: '金台区',
            value: '610303',
            children: null,
          },
          {
            label: '陈仓区',
            value: '610304',
            children: null,
          },
          {
            label: '凤翔县',
            value: '610322',
            children: null,
          },
          {
            label: '岐山县',
            value: '610323',
            children: null,
          },
          {
            label: '扶风县',
            value: '610324',
            children: null,
          },
          {
            label: '眉县',
            value: '610326',
            children: null,
          },
          {
            label: '陇县',
            value: '610327',
            children: null,
          },
          {
            label: '千阳县',
            value: '610328',
            children: null,
          },
          {
            label: '麟游县',
            value: '610329',
            children: null,
          },
          {
            label: '凤县',
            value: '610330',
            children: null,
          },
          {
            label: '太白县',
            value: '610331',
            children: null,
          },
        ],
      },
      {
        label: '咸阳市',
        value: '610400',
        children: [
          {
            label: '秦都区',
            value: '610402',
            children: null,
          },
          {
            label: '杨陵区',
            value: '610403',
            children: null,
          },
          {
            label: '渭城区',
            value: '610404',
            children: null,
          },
          {
            label: '三原县',
            value: '610422',
            children: null,
          },
          {
            label: '泾阳县',
            value: '610423',
            children: null,
          },
          {
            label: '乾县',
            value: '610424',
            children: null,
          },
          {
            label: '礼泉县',
            value: '610425',
            children: null,
          },
          {
            label: '永寿县',
            value: '610426',
            children: null,
          },
          {
            label: '长武县',
            value: '610428',
            children: null,
          },
          {
            label: '旬邑县',
            value: '610429',
            children: null,
          },
          {
            label: '淳化县',
            value: '610430',
            children: null,
          },
          {
            label: '武功县',
            value: '610431',
            children: null,
          },
          {
            label: '兴平市',
            value: '610481',
            children: null,
          },
          {
            label: '彬州市',
            value: '610482',
            children: null,
          },
        ],
      },
      {
        label: '渭南市',
        value: '610500',
        children: [
          {
            label: '临渭区',
            value: '610502',
            children: null,
          },
          {
            label: '华州区',
            value: '610503',
            children: null,
          },
          {
            label: '潼关县',
            value: '610522',
            children: null,
          },
          {
            label: '大荔县',
            value: '610523',
            children: null,
          },
          {
            label: '合阳县',
            value: '610524',
            children: null,
          },
          {
            label: '澄城县',
            value: '610525',
            children: null,
          },
          {
            label: '蒲城县',
            value: '610526',
            children: null,
          },
          {
            label: '白水县',
            value: '610527',
            children: null,
          },
          {
            label: '富平县',
            value: '610528',
            children: null,
          },
          {
            label: '韩城市',
            value: '610581',
            children: null,
          },
          {
            label: '华阴市',
            value: '610582',
            children: null,
          },
        ],
      },
      {
        label: '延安市',
        value: '610600',
        children: [
          {
            label: '宝塔区',
            value: '610602',
            children: null,
          },
          {
            label: '安塞区',
            value: '610603',
            children: null,
          },
          {
            label: '延长县',
            value: '610621',
            children: null,
          },
          {
            label: '延川县',
            value: '610622',
            children: null,
          },
          {
            label: '子长县',
            value: '610623',
            children: null,
          },
          {
            label: '志丹县',
            value: '610625',
            children: null,
          },
          {
            label: '吴起县',
            value: '610626',
            children: null,
          },
          {
            label: '甘泉县',
            value: '610627',
            children: null,
          },
          {
            label: '富县',
            value: '610628',
            children: null,
          },
          {
            label: '洛川县',
            value: '610629',
            children: null,
          },
          {
            label: '宜川县',
            value: '610630',
            children: null,
          },
          {
            label: '黄龙县',
            value: '610631',
            children: null,
          },
          {
            label: '黄陵县',
            value: '610632',
            children: null,
          },
        ],
      },
      {
        label: '汉中市',
        value: '610700',
        children: [
          {
            label: '汉台区',
            value: '610702',
            children: null,
          },
          {
            label: '南郑区',
            value: '610703',
            children: null,
          },
          {
            label: '城固县',
            value: '610722',
            children: null,
          },
          {
            label: '洋县',
            value: '610723',
            children: null,
          },
          {
            label: '西乡县',
            value: '610724',
            children: null,
          },
          {
            label: '勉县',
            value: '610725',
            children: null,
          },
          {
            label: '宁强县',
            value: '610726',
            children: null,
          },
          {
            label: '略阳县',
            value: '610727',
            children: null,
          },
          {
            label: '镇巴县',
            value: '610728',
            children: null,
          },
          {
            label: '留坝县',
            value: '610729',
            children: null,
          },
          {
            label: '佛坪县',
            value: '610730',
            children: null,
          },
        ],
      },
      {
        label: '榆林市',
        value: '610800',
        children: [
          {
            label: '榆阳区',
            value: '610802',
            children: null,
          },
          {
            label: '横山区',
            value: '610803',
            children: null,
          },
          {
            label: '府谷县',
            value: '610822',
            children: null,
          },
          {
            label: '靖边县',
            value: '610824',
            children: null,
          },
          {
            label: '定边县',
            value: '610825',
            children: null,
          },
          {
            label: '绥德县',
            value: '610826',
            children: null,
          },
          {
            label: '米脂县',
            value: '610827',
            children: null,
          },
          {
            label: '佳县',
            value: '610828',
            children: null,
          },
          {
            label: '吴堡县',
            value: '610829',
            children: null,
          },
          {
            label: '清涧县',
            value: '610830',
            children: null,
          },
          {
            label: '子洲县',
            value: '610831',
            children: null,
          },
          {
            label: '神木市',
            value: '610881',
            children: null,
          },
        ],
      },
      {
        label: '安康市',
        value: '610900',
        children: [
          {
            label: '汉滨区',
            value: '610902',
            children: null,
          },
          {
            label: '汉阴县',
            value: '610921',
            children: null,
          },
          {
            label: '石泉县',
            value: '610922',
            children: null,
          },
          {
            label: '宁陕县',
            value: '610923',
            children: null,
          },
          {
            label: '紫阳县',
            value: '610924',
            children: null,
          },
          {
            label: '岚皋县',
            value: '610925',
            children: null,
          },
          {
            label: '平利县',
            value: '610926',
            children: null,
          },
          {
            label: '镇坪县',
            value: '610927',
            children: null,
          },
          {
            label: '旬阳县',
            value: '610928',
            children: null,
          },
          {
            label: '白河县',
            value: '610929',
            children: null,
          },
        ],
      },
      {
        label: '商洛市',
        value: '611000',
        children: [
          {
            label: '商州区',
            value: '611002',
            children: null,
          },
          {
            label: '洛南县',
            value: '611021',
            children: null,
          },
          {
            label: '丹凤县',
            value: '611022',
            children: null,
          },
          {
            label: '商南县',
            value: '611023',
            children: null,
          },
          {
            label: '山阳县',
            value: '611024',
            children: null,
          },
          {
            label: '镇安县',
            value: '611025',
            children: null,
          },
          {
            label: '柞水县',
            value: '611026',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '甘肃省',
    value: '620000',
    children: [
      {
        label: '兰州市',
        value: '620100',
        children: [
          {
            label: '城关区',
            value: '620102',
            children: null,
          },
          {
            label: '七里河区',
            value: '620103',
            children: null,
          },
          {
            label: '西固区',
            value: '620104',
            children: null,
          },
          {
            label: '安宁区',
            value: '620105',
            children: null,
          },
          {
            label: '红古区',
            value: '620111',
            children: null,
          },
          {
            label: '永登县',
            value: '620121',
            children: null,
          },
          {
            label: '皋兰县',
            value: '620122',
            children: null,
          },
          {
            label: '榆中县',
            value: '620123',
            children: null,
          },
        ],
      },
      {
        label: '嘉峪关市',
        value: '620200',
        children: [
          {
            label: '嘉峪关市',
            value: '620299',
            children: null,
          },
        ],
      },
      {
        label: '金昌市',
        value: '620300',
        children: [
          {
            label: '金川区',
            value: '620302',
            children: null,
          },
          {
            label: '永昌县',
            value: '620321',
            children: null,
          },
        ],
      },
      {
        label: '白银市',
        value: '620400',
        children: [
          {
            label: '白银区',
            value: '620402',
            children: null,
          },
          {
            label: '平川区',
            value: '620403',
            children: null,
          },
          {
            label: '靖远县',
            value: '620421',
            children: null,
          },
          {
            label: '会宁县',
            value: '620422',
            children: null,
          },
          {
            label: '景泰县',
            value: '620423',
            children: null,
          },
        ],
      },
      {
        label: '天水市',
        value: '620500',
        children: [
          {
            label: '秦州区',
            value: '620502',
            children: null,
          },
          {
            label: '麦积区',
            value: '620503',
            children: null,
          },
          {
            label: '清水县',
            value: '620521',
            children: null,
          },
          {
            label: '秦安县',
            value: '620522',
            children: null,
          },
          {
            label: '甘谷县',
            value: '620523',
            children: null,
          },
          {
            label: '武山县',
            value: '620524',
            children: null,
          },
          {
            label: '张家川回族自治县',
            value: '620525',
            children: null,
          },
        ],
      },
      {
        label: '武威市',
        value: '620600',
        children: [
          {
            label: '凉州区',
            value: '620602',
            children: null,
          },
          {
            label: '民勤县',
            value: '620621',
            children: null,
          },
          {
            label: '古浪县',
            value: '620622',
            children: null,
          },
          {
            label: '天祝藏族自治县',
            value: '620623',
            children: null,
          },
        ],
      },
      {
        label: '张掖市',
        value: '620700',
        children: [
          {
            label: '甘州区',
            value: '620702',
            children: null,
          },
          {
            label: '肃南裕固族自治县',
            value: '620721',
            children: null,
          },
          {
            label: '民乐县',
            value: '620722',
            children: null,
          },
          {
            label: '临泽县',
            value: '620723',
            children: null,
          },
          {
            label: '高台县',
            value: '620724',
            children: null,
          },
          {
            label: '山丹县',
            value: '620725',
            children: null,
          },
        ],
      },
      {
        label: '平凉市',
        value: '620800',
        children: [
          {
            label: '崆峒区',
            value: '620802',
            children: null,
          },
          {
            label: '泾川县',
            value: '620821',
            children: null,
          },
          {
            label: '灵台县',
            value: '620822',
            children: null,
          },
          {
            label: '崇信县',
            value: '620823',
            children: null,
          },
          {
            label: '庄浪县',
            value: '620825',
            children: null,
          },
          {
            label: '静宁县',
            value: '620826',
            children: null,
          },
          {
            label: '华亭市',
            value: '620881',
            children: null,
          },
        ],
      },
      {
        label: '酒泉市',
        value: '620900',
        children: [
          {
            label: '肃州区',
            value: '620902',
            children: null,
          },
          {
            label: '金塔县',
            value: '620921',
            children: null,
          },
          {
            label: '瓜州县',
            value: '620922',
            children: null,
          },
          {
            label: '肃北蒙古族自治县',
            value: '620923',
            children: null,
          },
          {
            label: '阿克塞哈萨克族自治县',
            value: '620924',
            children: null,
          },
          {
            label: '玉门市',
            value: '620981',
            children: null,
          },
          {
            label: '敦煌市',
            value: '620982',
            children: null,
          },
        ],
      },
      {
        label: '庆阳市',
        value: '621000',
        children: [
          {
            label: '西峰区',
            value: '621002',
            children: null,
          },
          {
            label: '庆城县',
            value: '621021',
            children: null,
          },
          {
            label: '环县',
            value: '621022',
            children: null,
          },
          {
            label: '华池县',
            value: '621023',
            children: null,
          },
          {
            label: '合水县',
            value: '621024',
            children: null,
          },
          {
            label: '正宁县',
            value: '621025',
            children: null,
          },
          {
            label: '宁县',
            value: '621026',
            children: null,
          },
          {
            label: '镇原县',
            value: '621027',
            children: null,
          },
        ],
      },
      {
        label: '定西市',
        value: '621100',
        children: [
          {
            label: '安定区',
            value: '621102',
            children: null,
          },
          {
            label: '通渭县',
            value: '621121',
            children: null,
          },
          {
            label: '陇西县',
            value: '621122',
            children: null,
          },
          {
            label: '渭源县',
            value: '621123',
            children: null,
          },
          {
            label: '临洮县',
            value: '621124',
            children: null,
          },
          {
            label: '漳县',
            value: '621125',
            children: null,
          },
          {
            label: '岷县',
            value: '621126',
            children: null,
          },
        ],
      },
      {
        label: '陇南市',
        value: '621200',
        children: [
          {
            label: '武都区',
            value: '621202',
            children: null,
          },
          {
            label: '成县',
            value: '621221',
            children: null,
          },
          {
            label: '文县',
            value: '621222',
            children: null,
          },
          {
            label: '宕昌县',
            value: '621223',
            children: null,
          },
          {
            label: '康县',
            value: '621224',
            children: null,
          },
          {
            label: '西和县',
            value: '621225',
            children: null,
          },
          {
            label: '礼县',
            value: '621226',
            children: null,
          },
          {
            label: '徽县',
            value: '621227',
            children: null,
          },
          {
            label: '两当县',
            value: '621228',
            children: null,
          },
        ],
      },
      {
        label: '临夏回族自治州',
        value: '622900',
        children: [
          {
            label: '临夏市',
            value: '622901',
            children: null,
          },
          {
            label: '临夏县',
            value: '622921',
            children: null,
          },
          {
            label: '康乐县',
            value: '622922',
            children: null,
          },
          {
            label: '永靖县',
            value: '622923',
            children: null,
          },
          {
            label: '广河县',
            value: '622924',
            children: null,
          },
          {
            label: '和政县',
            value: '622925',
            children: null,
          },
          {
            label: '东乡族自治县',
            value: '622926',
            children: null,
          },
          {
            label: '积石山县',
            value: '622927',
            children: null,
          },
        ],
      },
      {
        label: '甘南藏族自治州',
        value: '623000',
        children: [
          {
            label: '合作市',
            value: '623001',
            children: null,
          },
          {
            label: '临潭县',
            value: '623021',
            children: null,
          },
          {
            label: '卓尼县',
            value: '623022',
            children: null,
          },
          {
            label: '舟曲县',
            value: '623023',
            children: null,
          },
          {
            label: '迭部县',
            value: '623024',
            children: null,
          },
          {
            label: '玛曲县',
            value: '623025',
            children: null,
          },
          {
            label: '碌曲县',
            value: '623026',
            children: null,
          },
          {
            label: '夏河县',
            value: '623027',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '青海省',
    value: '630000',
    children: [
      {
        label: '西宁市',
        value: '630100',
        children: [
          {
            label: '城东区',
            value: '630102',
            children: null,
          },
          {
            label: '城中区',
            value: '630103',
            children: null,
          },
          {
            label: '城西区',
            value: '630104',
            children: null,
          },
          {
            label: '城北区',
            value: '630105',
            children: null,
          },
          {
            label: '大通回族土族自治县',
            value: '630121',
            children: null,
          },
          {
            label: '湟中县',
            value: '630122',
            children: null,
          },
          {
            label: '湟源县',
            value: '630123',
            children: null,
          },
        ],
      },
      {
        label: '海东市',
        value: '630200',
        children: [
          {
            label: '乐都区',
            value: '630202',
            children: null,
          },
          {
            label: '平安区',
            value: '630203',
            children: null,
          },
          {
            label: '民和回族土族自治县',
            value: '630222',
            children: null,
          },
          {
            label: '互助土族自治县',
            value: '630223',
            children: null,
          },
          {
            label: '化隆回族自治县',
            value: '630224',
            children: null,
          },
          {
            label: '循化撒拉族自治县',
            value: '630225',
            children: null,
          },
        ],
      },
      {
        label: '海北藏族自治州',
        value: '632200',
        children: [
          {
            label: '门源回族自治县',
            value: '632221',
            children: null,
          },
          {
            label: '祁连县',
            value: '632222',
            children: null,
          },
          {
            label: '海晏县',
            value: '632223',
            children: null,
          },
          {
            label: '刚察县',
            value: '632224',
            children: null,
          },
        ],
      },
      {
        label: '黄南藏族自治州',
        value: '632300',
        children: [
          {
            label: '同仁县',
            value: '632321',
            children: null,
          },
          {
            label: '尖扎县',
            value: '632322',
            children: null,
          },
          {
            label: '泽库县',
            value: '632323',
            children: null,
          },
          {
            label: '河南蒙古族自治县',
            value: '632324',
            children: null,
          },
        ],
      },
      {
        label: '海南藏族自治州',
        value: '632500',
        children: [
          {
            label: '共和县',
            value: '632521',
            children: null,
          },
          {
            label: '同德县',
            value: '632522',
            children: null,
          },
          {
            label: '贵德县',
            value: '632523',
            children: null,
          },
          {
            label: '兴海县',
            value: '632524',
            children: null,
          },
          {
            label: '贵南县',
            value: '632525',
            children: null,
          },
        ],
      },
      {
        label: '果洛藏族自治州',
        value: '632600',
        children: [
          {
            label: '玛沁县',
            value: '632621',
            children: null,
          },
          {
            label: '班玛县',
            value: '632622',
            children: null,
          },
          {
            label: '甘德县',
            value: '632623',
            children: null,
          },
          {
            label: '达日县',
            value: '632624',
            children: null,
          },
          {
            label: '久治县',
            value: '632625',
            children: null,
          },
          {
            label: '玛多县',
            value: '632626',
            children: null,
          },
        ],
      },
      {
        label: '玉树藏族自治州',
        value: '632700',
        children: [
          {
            label: '玉树市',
            value: '632701',
            children: null,
          },
          {
            label: '杂多县',
            value: '632722',
            children: null,
          },
          {
            label: '称多县',
            value: '632723',
            children: null,
          },
          {
            label: '治多县',
            value: '632724',
            children: null,
          },
          {
            label: '囊谦县',
            value: '632725',
            children: null,
          },
          {
            label: '曲麻莱县',
            value: '632726',
            children: null,
          },
        ],
      },
      {
        label: '海西蒙古族藏族自治州',
        value: '632800',
        children: [
          {
            label: '格尔木市',
            value: '632801',
            children: null,
          },
          {
            label: '德令哈市',
            value: '632802',
            children: null,
          },
          {
            label: '茫崖市',
            value: '632803',
            children: null,
          },
          {
            label: '乌兰县',
            value: '632821',
            children: null,
          },
          {
            label: '都兰县',
            value: '632822',
            children: null,
          },
          {
            label: '天峻县',
            value: '632823',
            children: null,
          },
          {
            label: '大柴旦行政委员会',
            value: '632825',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '宁夏回族自治区',
    value: '640000',
    children: [
      {
        label: '银川市',
        value: '640100',
        children: [
          {
            label: '兴庆区',
            value: '640104',
            children: null,
          },
          {
            label: '西夏区',
            value: '640105',
            children: null,
          },
          {
            label: '金凤区',
            value: '640106',
            children: null,
          },
          {
            label: '永宁县',
            value: '640121',
            children: null,
          },
          {
            label: '贺兰县',
            value: '640122',
            children: null,
          },
          {
            label: '灵武市',
            value: '640181',
            children: null,
          },
        ],
      },
      {
        label: '石嘴山市',
        value: '640200',
        children: [
          {
            label: '大武口区',
            value: '640202',
            children: null,
          },
          {
            label: '惠农区',
            value: '640205',
            children: null,
          },
          {
            label: '平罗县',
            value: '640221',
            children: null,
          },
        ],
      },
      {
        label: '吴忠市',
        value: '640300',
        children: [
          {
            label: '利通区',
            value: '640302',
            children: null,
          },
          {
            label: '红寺堡区',
            value: '640303',
            children: null,
          },
          {
            label: '盐池县',
            value: '640323',
            children: null,
          },
          {
            label: '同心县',
            value: '640324',
            children: null,
          },
          {
            label: '青铜峡市',
            value: '640381',
            children: null,
          },
        ],
      },
      {
        label: '固原市',
        value: '640400',
        children: [
          {
            label: '原州区',
            value: '640402',
            children: null,
          },
          {
            label: '西吉县',
            value: '640422',
            children: null,
          },
          {
            label: '隆德县',
            value: '640423',
            children: null,
          },
          {
            label: '泾源县',
            value: '640424',
            children: null,
          },
          {
            label: '彭阳县',
            value: '640425',
            children: null,
          },
        ],
      },
      {
        label: '中卫市',
        value: '640500',
        children: [
          {
            label: '沙坡头区',
            value: '640502',
            children: null,
          },
          {
            label: '中宁县',
            value: '640521',
            children: null,
          },
          {
            label: '海原县',
            value: '640522',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '新疆维吾尔自治区',
    value: '650000',
    children: [
      {
        label: '乌鲁木齐市',
        value: '650100',
        children: [
          {
            label: '天山区',
            value: '650102',
            children: null,
          },
          {
            label: '沙依巴克区',
            value: '650103',
            children: null,
          },
          {
            label: '新市区',
            value: '650104',
            children: null,
          },
          {
            label: '水磨沟区',
            value: '650105',
            children: null,
          },
          {
            label: '头屯河区',
            value: '650106',
            children: null,
          },
          {
            label: '达坂城区',
            value: '650107',
            children: null,
          },
          {
            label: '米东区',
            value: '650109',
            children: null,
          },
          {
            label: '乌鲁木齐县',
            value: '650121',
            children: null,
          },
        ],
      },
      {
        label: '克拉玛依市',
        value: '650200',
        children: [
          {
            label: '独山子区',
            value: '650202',
            children: null,
          },
          {
            label: '克拉玛依区',
            value: '650203',
            children: null,
          },
          {
            label: '白碱滩区',
            value: '650204',
            children: null,
          },
          {
            label: '乌尔禾区',
            value: '650205',
            children: null,
          },
        ],
      },
      {
        label: '吐鲁番市',
        value: '650400',
        children: [
          {
            label: '高昌区',
            value: '650402',
            children: null,
          },
          {
            label: '鄯善县',
            value: '650421',
            children: null,
          },
          {
            label: '托克逊县',
            value: '650422',
            children: null,
          },
        ],
      },
      {
        label: '哈密市',
        value: '650500',
        children: [
          {
            label: '伊州区',
            value: '650502',
            children: null,
          },
          {
            label: '巴里坤哈萨克自治县',
            value: '650521',
            children: null,
          },
          {
            label: '伊吾县',
            value: '650522',
            children: null,
          },
        ],
      },
      {
        label: '昌吉回族自治州',
        value: '652300',
        children: [
          {
            label: '昌吉市',
            value: '652301',
            children: null,
          },
          {
            label: '阜康市',
            value: '652302',
            children: null,
          },
          {
            label: '呼图壁县',
            value: '652323',
            children: null,
          },
          {
            label: '玛纳斯县',
            value: '652324',
            children: null,
          },
          {
            label: '奇台县',
            value: '652325',
            children: null,
          },
          {
            label: '吉木萨尔县',
            value: '652327',
            children: null,
          },
          {
            label: '木垒哈萨克自治县',
            value: '652328',
            children: null,
          },
        ],
      },
      {
        label: '博尔塔拉蒙古自治州',
        value: '652700',
        children: [
          {
            label: '博乐市',
            value: '652701',
            children: null,
          },
          {
            label: '阿拉山口市',
            value: '652702',
            children: null,
          },
          {
            label: '精河县',
            value: '652722',
            children: null,
          },
          {
            label: '温泉县',
            value: '652723',
            children: null,
          },
        ],
      },
      {
        label: '巴音郭楞蒙古自治州',
        value: '652800',
        children: [
          {
            label: '库尔勒市',
            value: '652801',
            children: null,
          },
          {
            label: '轮台县',
            value: '652822',
            children: null,
          },
          {
            label: '尉犁县',
            value: '652823',
            children: null,
          },
          {
            label: '若羌县',
            value: '652824',
            children: null,
          },
          {
            label: '且末县',
            value: '652825',
            children: null,
          },
          {
            label: '焉耆回族自治县',
            value: '652826',
            children: null,
          },
          {
            label: '和静县',
            value: '652827',
            children: null,
          },
          {
            label: '和硕县',
            value: '652828',
            children: null,
          },
          {
            label: '博湖县',
            value: '652829',
            children: null,
          },
        ],
      },
      {
        label: '阿克苏地区',
        value: '652900',
        children: [
          {
            label: '阿克苏市',
            value: '652901',
            children: null,
          },
          {
            label: '温宿县',
            value: '652922',
            children: null,
          },
          {
            label: '库车县',
            value: '652923',
            children: null,
          },
          {
            label: '沙雅县',
            value: '652924',
            children: null,
          },
          {
            label: '新和县',
            value: '652925',
            children: null,
          },
          {
            label: '拜城县',
            value: '652926',
            children: null,
          },
          {
            label: '乌什县',
            value: '652927',
            children: null,
          },
          {
            label: '阿瓦提县',
            value: '652928',
            children: null,
          },
          {
            label: '柯坪县',
            value: '652929',
            children: null,
          },
        ],
      },
      {
        label: '克孜勒苏柯尔克孜自治州',
        value: '653000',
        children: [
          {
            label: '阿图什市',
            value: '653001',
            children: null,
          },
          {
            label: '阿克陶县',
            value: '653022',
            children: null,
          },
          {
            label: '阿合奇县',
            value: '653023',
            children: null,
          },
          {
            label: '乌恰县',
            value: '653024',
            children: null,
          },
        ],
      },
      {
        label: '喀什地区',
        value: '653100',
        children: [
          {
            label: '喀什市',
            value: '653101',
            children: null,
          },
          {
            label: '疏附县',
            value: '653121',
            children: null,
          },
          {
            label: '疏勒县',
            value: '653122',
            children: null,
          },
          {
            label: '英吉沙县',
            value: '653123',
            children: null,
          },
          {
            label: '泽普县',
            value: '653124',
            children: null,
          },
          {
            label: '莎车县',
            value: '653125',
            children: null,
          },
          {
            label: '叶城县',
            value: '653126',
            children: null,
          },
          {
            label: '麦盖提县',
            value: '653127',
            children: null,
          },
          {
            label: '岳普湖县',
            value: '653128',
            children: null,
          },
          {
            label: '伽师县',
            value: '653129',
            children: null,
          },
          {
            label: '巴楚县',
            value: '653130',
            children: null,
          },
          {
            label: '塔什库尔干塔吉克自治县',
            value: '653131',
            children: null,
          },
        ],
      },
      {
        label: '和田地区',
        value: '653200',
        children: [
          {
            label: '和田市',
            value: '653201',
            children: null,
          },
          {
            label: '和田县',
            value: '653221',
            children: null,
          },
          {
            label: '墨玉县',
            value: '653222',
            children: null,
          },
          {
            label: '皮山县',
            value: '653223',
            children: null,
          },
          {
            label: '洛浦县',
            value: '653224',
            children: null,
          },
          {
            label: '策勒县',
            value: '653225',
            children: null,
          },
          {
            label: '于田县',
            value: '653226',
            children: null,
          },
          {
            label: '民丰县',
            value: '653227',
            children: null,
          },
        ],
      },
      {
        label: '伊犁哈萨克自治州',
        value: '654000',
        children: [
          {
            label: '伊宁市',
            value: '654002',
            children: null,
          },
          {
            label: '奎屯市',
            value: '654003',
            children: null,
          },
          {
            label: '霍尔果斯市',
            value: '654004',
            children: null,
          },
          {
            label: '伊宁县',
            value: '654021',
            children: null,
          },
          {
            label: '察布查尔锡伯自治县',
            value: '654022',
            children: null,
          },
          {
            label: '霍城县',
            value: '654023',
            children: null,
          },
          {
            label: '巩留县',
            value: '654024',
            children: null,
          },
          {
            label: '新源县',
            value: '654025',
            children: null,
          },
          {
            label: '昭苏县',
            value: '654026',
            children: null,
          },
          {
            label: '特克斯县',
            value: '654027',
            children: null,
          },
          {
            label: '尼勒克县',
            value: '654028',
            children: null,
          },
        ],
      },
      {
        label: '塔城地区',
        value: '654200',
        children: [
          {
            label: '塔城市',
            value: '654201',
            children: null,
          },
          {
            label: '乌苏市',
            value: '654202',
            children: null,
          },
          {
            label: '额敏县',
            value: '654221',
            children: null,
          },
          {
            label: '沙湾县',
            value: '654223',
            children: null,
          },
          {
            label: '托里县',
            value: '654224',
            children: null,
          },
          {
            label: '裕民县',
            value: '654225',
            children: null,
          },
          {
            label: '和布克赛尔蒙古自治县',
            value: '654226',
            children: null,
          },
        ],
      },
      {
        label: '阿勒泰地区',
        value: '654300',
        children: [
          {
            label: '阿勒泰市',
            value: '654301',
            children: null,
          },
          {
            label: '布尔津县',
            value: '654321',
            children: null,
          },
          {
            label: '富蕴县',
            value: '654322',
            children: null,
          },
          {
            label: '福海县',
            value: '654323',
            children: null,
          },
          {
            label: '哈巴河县',
            value: '654324',
            children: null,
          },
          {
            label: '青河县',
            value: '654325',
            children: null,
          },
          {
            label: '吉木乃县',
            value: '654326',
            children: null,
          },
        ],
      },
      {
        label: '石河子市',
        value: '659001',
        children: [
          {
            label: '新城街道',
            value: '659001001',
            children: null,
          },
          {
            label: '向阳街道',
            value: '659001002',
            children: null,
          },
          {
            label: '红山街道',
            value: '659001003',
            children: null,
          },
          {
            label: '老街街道',
            value: '659001004',
            children: null,
          },
          {
            label: '东城街道',
            value: '659001005',
            children: null,
          },
          {
            label: '北泉镇',
            value: '659001100',
            children: null,
          },
          {
            label: '石河子镇',
            value: '659001200',
            children: null,
          },
          {
            label: '兵团一五二团',
            value: '659001500',
            children: null,
          },
        ],
      },
      {
        label: '阿拉尔市',
        value: '659002',
        children: [
          {
            label: '金银川路街道',
            value: '659002001',
            children: null,
          },
          {
            label: '幸福路街道',
            value: '659002002',
            children: null,
          },
          {
            label: '青松路街道',
            value: '659002003',
            children: null,
          },
          {
            label: '南口街道',
            value: '659002004',
            children: null,
          },
          {
            label: '托喀依乡',
            value: '659002200',
            children: null,
          },
          {
            label: '兵团七团',
            value: '659002500',
            children: null,
          },
          {
            label: '兵团八团',
            value: '659002501',
            children: null,
          },
          {
            label: '兵团十团',
            value: '659002503',
            children: null,
          },
          {
            label: '兵团十二团',
            value: '659002505',
            children: null,
          },
          {
            label: '兵团十四团',
            value: '659002507',
            children: null,
          },
          {
            label: '兵团五团',
            value: '659002508',
            children: null,
          },
          {
            label: '兵团十六团',
            value: '659002509',
            children: null,
          },
          {
            label: '兵团第一师水利水电工程处',
            value: '659002511',
            children: null,
          },
          {
            label: '阿拉尔农场',
            value: '659002513',
            children: null,
          },
          {
            label: '兵团第一师幸福农场',
            value: '659002514',
            children: null,
          },
          {
            label: '兵团二团',
            value: '659002901',
            children: null,
          },
          {
            label: '兵团农一师沙井子水利管理处',
            value: '659002902',
            children: null,
          },
          {
            label: '兵团九团',
            value: '659002964',
            children: null,
          },
          {
            label: '兵团十一团',
            value: '659002966',
            children: null,
          },
          {
            label: '兵团十三团',
            value: '659002967',
            children: null,
          },
          {
            label: '兵团十五团',
            value: '659002968',
            children: null,
          },
        ],
      },
      {
        label: '图木舒克市',
        value: '659003',
        children: [
          {
            label: '齐干却勒街道',
            value: '659003001',
            children: null,
          },
          {
            label: '前海街道',
            value: '659003002',
            children: null,
          },
          {
            label: '永安坝街道',
            value: '659003003',
            children: null,
          },
          {
            label: '兵团四十四团',
            value: '659003504',
            children: null,
          },
          {
            label: '兵团四十九团',
            value: '659003509',
            children: null,
          },
          {
            label: '兵团五十三团',
            value: '659003513',
            children: null,
          },
          {
            label: '喀拉拜勒镇',
            value: '659003960',
            children: null,
          },
          {
            label: '兵团五十一团',
            value: '659003964',
            children: null,
          },
          {
            label: '兵团五十二团',
            value: '659003965',
            children: null,
          },
          {
            label: '兵团五十团',
            value: '659003966',
            children: null,
          },
        ],
      },
      {
        label: '五家渠市',
        value: '659004',
        children: [
          {
            label: '军垦路街道',
            value: '659004001',
            children: null,
          },
          {
            label: '青湖路街道',
            value: '659004002',
            children: null,
          },
          {
            label: '人民路街道',
            value: '659004003',
            children: null,
          },
          {
            label: '兵团一零一团',
            value: '659004500',
            children: null,
          },
          {
            label: '蔡家湖镇',
            value: '659004960',
            children: null,
          },
          {
            label: '梧桐镇',
            value: '659004961',
            children: null,
          },
        ],
      },
      {
        label: '北屯市',
        value: '659005',
        children: [
          {
            label: '兵团一八七团',
            value: '659005502',
            children: null,
          },
          {
            label: '兵团一八八团',
            value: '659005503',
            children: null,
          },
        ],
      },
      {
        label: '铁门关市',
        value: '659006',
        children: [
          {
            label: '兵团二十九团',
            value: '659006501',
            children: null,
          },
          {
            label: '农二师三十团',
            value: '659006502',
            children: null,
          },
        ],
      },
      {
        label: '双河市',
        value: '659007',
        children: [
          {
            label: '兵团八十一团',
            value: '659007501',
            children: null,
          },
          {
            label: '兵团八十四团',
            value: '659007502',
            children: null,
          },
          {
            label: '兵团八十六团',
            value: '659007504',
            children: null,
          },
          {
            label: '兵团八十九团',
            value: '659007505',
            children: null,
          },
          {
            label: '兵团九十团',
            value: '659007506',
            children: null,
          },
        ],
      },
      {
        label: '可克达拉市',
        value: '659008',
        children: [
          {
            label: '兵团六十七团',
            value: '659008502',
            children: null,
          },
          {
            label: '兵团六十八团',
            value: '659008503',
            children: null,
          },
          {
            label: '兵团六十三团',
            value: '659008507',
            children: null,
          },
          {
            label: '兵团六十四团',
            value: '659008508',
            children: null,
          },
          {
            label: '兵团六十六团',
            value: '659008509',
            children: null,
          },
        ],
      },
      {
        label: '昆玉市',
        value: '659009',
        children: [
          {
            label: '兵团一牧场',
            value: '659009400',
            children: null,
          },
          {
            label: '兵团皮山农场',
            value: '659009401',
            children: null,
          },
          {
            label: '兵团二二四团',
            value: '659009501',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '台湾省',
    value: '710000',
    children: [
      {
        label: '台北市',
        value: '710100',
        children: [
          {
            label: '中正区',
            value: '710101',
            children: null,
          },
          {
            label: '大同区',
            value: '710102',
            children: null,
          },
          {
            label: '中山区',
            value: '710103',
            children: null,
          },
          {
            label: '松山区',
            value: '710104',
            children: null,
          },
          {
            label: '大安区',
            value: '710105',
            children: null,
          },
          {
            label: '万华区',
            value: '710106',
            children: null,
          },
          {
            label: '信义区',
            value: '710107',
            children: null,
          },
          {
            label: '士林区',
            value: '710108',
            children: null,
          },
          {
            label: '北投区',
            value: '710109',
            children: null,
          },
          {
            label: '内湖区',
            value: '710110',
            children: null,
          },
          {
            label: '南港区',
            value: '710111',
            children: null,
          },
          {
            label: '文山区',
            value: '710112',
            children: null,
          },
        ],
      },
      {
        label: '高雄市',
        value: '710200',
        children: [
          {
            label: '新兴区',
            value: '710201',
            children: null,
          },
          {
            label: '前金区',
            value: '710202',
            children: null,
          },
          {
            label: '苓雅区',
            value: '710203',
            children: null,
          },
          {
            label: '盐埕区',
            value: '710204',
            children: null,
          },
          {
            label: '鼓山区',
            value: '710205',
            children: null,
          },
          {
            label: '旗津区',
            value: '710206',
            children: null,
          },
          {
            label: '前镇区',
            value: '710207',
            children: null,
          },
          {
            label: '三民区',
            value: '710208',
            children: null,
          },
          {
            label: '左营区',
            value: '710209',
            children: null,
          },
          {
            label: '楠梓区',
            value: '710210',
            children: null,
          },
          {
            label: '小港区',
            value: '710211',
            children: null,
          },
          {
            label: '仁武区',
            value: '710242',
            children: null,
          },
          {
            label: '大社区',
            value: '710243',
            children: null,
          },
          {
            label: '冈山区',
            value: '710244',
            children: null,
          },
          {
            label: '路竹区',
            value: '710245',
            children: null,
          },
          {
            label: '阿莲区',
            value: '710246',
            children: null,
          },
          {
            label: '田寮区',
            value: '710247',
            children: null,
          },
          {
            label: '燕巢区',
            value: '710248',
            children: null,
          },
          {
            label: '桥头区',
            value: '710249',
            children: null,
          },
          {
            label: '梓官区',
            value: '710250',
            children: null,
          },
          {
            label: '弥陀区',
            value: '710251',
            children: null,
          },
          {
            label: '永安区',
            value: '710252',
            children: null,
          },
          {
            label: '湖内区',
            value: '710253',
            children: null,
          },
          {
            label: '凤山区',
            value: '710254',
            children: null,
          },
          {
            label: '大寮区',
            value: '710255',
            children: null,
          },
          {
            label: '林园区',
            value: '710256',
            children: null,
          },
          {
            label: '鸟松区',
            value: '710257',
            children: null,
          },
          {
            label: '大树区',
            value: '710258',
            children: null,
          },
          {
            label: '旗山区',
            value: '710259',
            children: null,
          },
          {
            label: '美浓区',
            value: '710260',
            children: null,
          },
          {
            label: '六龟区',
            value: '710261',
            children: null,
          },
          {
            label: '内门区',
            value: '710262',
            children: null,
          },
          {
            label: '杉林区',
            value: '710263',
            children: null,
          },
          {
            label: '甲仙区',
            value: '710264',
            children: null,
          },
          {
            label: '桃源区',
            value: '710265',
            children: null,
          },
          {
            label: '那玛夏区',
            value: '710266',
            children: null,
          },
          {
            label: '茂林区',
            value: '710267',
            children: null,
          },
          {
            label: '茄萣区',
            value: '710268',
            children: null,
          },
        ],
      },
      {
        label: '台南市',
        value: '710300',
        children: [
          {
            label: '中西区',
            value: '710301',
            children: null,
          },
          {
            label: '东区',
            value: '710302',
            children: null,
          },
          {
            label: '南区',
            value: '710303',
            children: null,
          },
          {
            label: '北区',
            value: '710304',
            children: null,
          },
          {
            label: '安平区',
            value: '710305',
            children: null,
          },
          {
            label: '安南区',
            value: '710306',
            children: null,
          },
          {
            label: '永康区',
            value: '710339',
            children: null,
          },
          {
            label: '归仁区',
            value: '710340',
            children: null,
          },
          {
            label: '新化区',
            value: '710341',
            children: null,
          },
          {
            label: '左镇区',
            value: '710342',
            children: null,
          },
          {
            label: '玉井区',
            value: '710343',
            children: null,
          },
          {
            label: '楠西区',
            value: '710344',
            children: null,
          },
          {
            label: '南化区',
            value: '710345',
            children: null,
          },
          {
            label: '仁德区',
            value: '710346',
            children: null,
          },
          {
            label: '关庙区',
            value: '710347',
            children: null,
          },
          {
            label: '龙崎区',
            value: '710348',
            children: null,
          },
          {
            label: '官田区',
            value: '710349',
            children: null,
          },
          {
            label: '麻豆区',
            value: '710350',
            children: null,
          },
          {
            label: '佳里区',
            value: '710351',
            children: null,
          },
          {
            label: '西港区',
            value: '710352',
            children: null,
          },
          {
            label: '七股区',
            value: '710353',
            children: null,
          },
          {
            label: '将军区',
            value: '710354',
            children: null,
          },
          {
            label: '学甲区',
            value: '710355',
            children: null,
          },
          {
            label: '北门区',
            value: '710356',
            children: null,
          },
          {
            label: '新营区',
            value: '710357',
            children: null,
          },
          {
            label: '后壁区',
            value: '710358',
            children: null,
          },
          {
            label: '白河区',
            value: '710359',
            children: null,
          },
          {
            label: '东山区',
            value: '710360',
            children: null,
          },
          {
            label: '六甲区',
            value: '710361',
            children: null,
          },
          {
            label: '下营区',
            value: '710362',
            children: null,
          },
          {
            label: '柳营区',
            value: '710363',
            children: null,
          },
          {
            label: '盐水区',
            value: '710364',
            children: null,
          },
          {
            label: '善化区',
            value: '710365',
            children: null,
          },
          {
            label: '大内区',
            value: '710366',
            children: null,
          },
          {
            label: '山上区',
            value: '710367',
            children: null,
          },
          {
            label: '新市区',
            value: '710368',
            children: null,
          },
          {
            label: '安定区',
            value: '710369',
            children: null,
          },
        ],
      },
      {
        label: '台中市',
        value: '710400',
        children: [
          {
            label: '中区',
            value: '710401',
            children: null,
          },
          {
            label: '东区',
            value: '710402',
            children: null,
          },
          {
            label: '南区',
            value: '710403',
            children: null,
          },
          {
            label: '西区',
            value: '710404',
            children: null,
          },
          {
            label: '北区',
            value: '710405',
            children: null,
          },
          {
            label: '北屯区',
            value: '710406',
            children: null,
          },
          {
            label: '西屯区',
            value: '710407',
            children: null,
          },
          {
            label: '南屯区',
            value: '710408',
            children: null,
          },
          {
            label: '太平区',
            value: '710431',
            children: null,
          },
          {
            label: '大里区',
            value: '710432',
            children: null,
          },
          {
            label: '雾峰区',
            value: '710433',
            children: null,
          },
          {
            label: '乌日区',
            value: '710434',
            children: null,
          },
          {
            label: '丰原区',
            value: '710435',
            children: null,
          },
          {
            label: '后里区',
            value: '710436',
            children: null,
          },
          {
            label: '石冈区',
            value: '710437',
            children: null,
          },
          {
            label: '东势区',
            value: '710438',
            children: null,
          },
          {
            label: '和平区',
            value: '710439',
            children: null,
          },
          {
            label: '新社区',
            value: '710440',
            children: null,
          },
          {
            label: '潭子区',
            value: '710441',
            children: null,
          },
          {
            label: '大雅区',
            value: '710442',
            children: null,
          },
          {
            label: '神冈区',
            value: '710443',
            children: null,
          },
          {
            label: '大肚区',
            value: '710444',
            children: null,
          },
          {
            label: '沙鹿区',
            value: '710445',
            children: null,
          },
          {
            label: '龙井区',
            value: '710446',
            children: null,
          },
          {
            label: '梧栖区',
            value: '710447',
            children: null,
          },
          {
            label: '清水区',
            value: '710448',
            children: null,
          },
          {
            label: '大甲区',
            value: '710449',
            children: null,
          },
          {
            label: '外埔区',
            value: '710450',
            children: null,
          },
          {
            label: '大安区',
            value: '710451',
            children: null,
          },
        ],
      },
      {
        label: '南投县',
        value: '710600',
        children: [
          {
            label: '南投市',
            value: '710614',
            children: null,
          },
          {
            label: '中寮乡',
            value: '710615',
            children: null,
          },
          {
            label: '草屯镇',
            value: '710616',
            children: null,
          },
          {
            label: '国姓乡',
            value: '710617',
            children: null,
          },
          {
            label: '埔里镇',
            value: '710618',
            children: null,
          },
          {
            label: '仁爱乡',
            value: '710619',
            children: null,
          },
          {
            label: '名间乡',
            value: '710620',
            children: null,
          },
          {
            label: '集集镇',
            value: '710621',
            children: null,
          },
          {
            label: '水里乡',
            value: '710622',
            children: null,
          },
          {
            label: '鱼池乡',
            value: '710623',
            children: null,
          },
          {
            label: '信义乡',
            value: '710624',
            children: null,
          },
          {
            label: '竹山镇',
            value: '710625',
            children: null,
          },
          {
            label: '鹿谷乡',
            value: '710626',
            children: null,
          },
        ],
      },
      {
        label: '基隆市',
        value: '710700',
        children: [
          {
            label: '仁爱区',
            value: '710701',
            children: null,
          },
          {
            label: '信义区',
            value: '710702',
            children: null,
          },
          {
            label: '中正区',
            value: '710703',
            children: null,
          },
          {
            label: '中山区',
            value: '710704',
            children: null,
          },
          {
            label: '安乐区',
            value: '710705',
            children: null,
          },
          {
            label: '暖暖区',
            value: '710706',
            children: null,
          },
          {
            label: '七堵区',
            value: '710707',
            children: null,
          },
        ],
      },
      {
        label: '新竹市',
        value: '710800',
        children: [
          {
            label: '东区',
            value: '710801',
            children: null,
          },
          {
            label: '北区',
            value: '710802',
            children: null,
          },
          {
            label: '香山区',
            value: '710803',
            children: null,
          },
        ],
      },
      {
        label: '嘉义市',
        value: '710900',
        children: [
          {
            label: '东区',
            value: '710901',
            children: null,
          },
          {
            label: '西区',
            value: '710902',
            children: null,
          },
        ],
      },
      {
        label: '新北市',
        value: '711100',
        children: [
          {
            label: '万里区',
            value: '711130',
            children: null,
          },
          {
            label: '金山区',
            value: '711131',
            children: null,
          },
          {
            label: '板桥区',
            value: '711132',
            children: null,
          },
          {
            label: '汐止区',
            value: '711133',
            children: null,
          },
          {
            label: '深坑区',
            value: '711134',
            children: null,
          },
          {
            label: '石碇区',
            value: '711135',
            children: null,
          },
          {
            label: '瑞芳区',
            value: '711136',
            children: null,
          },
          {
            label: '平溪区',
            value: '711137',
            children: null,
          },
          {
            label: '双溪区',
            value: '711138',
            children: null,
          },
          {
            label: '贡寮区',
            value: '711139',
            children: null,
          },
          {
            label: '新店区',
            value: '711140',
            children: null,
          },
          {
            label: '坪林区',
            value: '711141',
            children: null,
          },
          {
            label: '乌来区',
            value: '711142',
            children: null,
          },
          {
            label: '永和区',
            value: '711143',
            children: null,
          },
          {
            label: '中和区',
            value: '711144',
            children: null,
          },
          {
            label: '土城区',
            value: '711145',
            children: null,
          },
          {
            label: '三峡区',
            value: '711146',
            children: null,
          },
          {
            label: '树林区',
            value: '711147',
            children: null,
          },
          {
            label: '莺歌区',
            value: '711148',
            children: null,
          },
          {
            label: '三重区',
            value: '711149',
            children: null,
          },
          {
            label: '新庄区',
            value: '711150',
            children: null,
          },
          {
            label: '泰山区',
            value: '711151',
            children: null,
          },
          {
            label: '林口区',
            value: '711152',
            children: null,
          },
          {
            label: '芦洲区',
            value: '711153',
            children: null,
          },
          {
            label: '五股区',
            value: '711154',
            children: null,
          },
          {
            label: '八里区',
            value: '711155',
            children: null,
          },
          {
            label: '淡水区',
            value: '711156',
            children: null,
          },
          {
            label: '三芝区',
            value: '711157',
            children: null,
          },
          {
            label: '石门区',
            value: '711158',
            children: null,
          },
        ],
      },
      {
        label: '宜兰县',
        value: '711200',
        children: [
          {
            label: '宜兰市',
            value: '711214',
            children: null,
          },
          {
            label: '头城镇',
            value: '711215',
            children: null,
          },
          {
            label: '礁溪乡',
            value: '711216',
            children: null,
          },
          {
            label: '壮围乡',
            value: '711217',
            children: null,
          },
          {
            label: '员山乡',
            value: '711218',
            children: null,
          },
          {
            label: '罗东镇',
            value: '711219',
            children: null,
          },
          {
            label: '三星乡',
            value: '711220',
            children: null,
          },
          {
            label: '大同乡',
            value: '711221',
            children: null,
          },
          {
            label: '五结乡',
            value: '711222',
            children: null,
          },
          {
            label: '冬山乡',
            value: '711223',
            children: null,
          },
          {
            label: '苏澳镇',
            value: '711224',
            children: null,
          },
          {
            label: '南澳乡',
            value: '711225',
            children: null,
          },
        ],
      },
      {
        label: '新竹县',
        value: '711300',
        children: [
          {
            label: '竹北市',
            value: '711314',
            children: null,
          },
          {
            label: '湖口乡',
            value: '711315',
            children: null,
          },
          {
            label: '新丰乡',
            value: '711316',
            children: null,
          },
          {
            label: '新埔镇',
            value: '711317',
            children: null,
          },
          {
            label: '关西镇',
            value: '711318',
            children: null,
          },
          {
            label: '芎林乡',
            value: '711319',
            children: null,
          },
          {
            label: '宝山乡',
            value: '711320',
            children: null,
          },
          {
            label: '竹东镇',
            value: '711321',
            children: null,
          },
          {
            label: '五峰乡',
            value: '711322',
            children: null,
          },
          {
            label: '横山乡',
            value: '711323',
            children: null,
          },
          {
            label: '尖石乡',
            value: '711324',
            children: null,
          },
          {
            label: '北埔乡',
            value: '711325',
            children: null,
          },
          {
            label: '峨眉乡',
            value: '711326',
            children: null,
          },
        ],
      },
      {
        label: '桃园市',
        value: '711400',
        children: [
          {
            label: '中坜区',
            value: '711414',
            children: null,
          },
          {
            label: '平镇区',
            value: '711415',
            children: null,
          },
          {
            label: '龙潭区',
            value: '711416',
            children: null,
          },
          {
            label: '杨梅区',
            value: '711417',
            children: null,
          },
          {
            label: '新屋区',
            value: '711418',
            children: null,
          },
          {
            label: '观音区',
            value: '711419',
            children: null,
          },
          {
            label: '桃园区',
            value: '711420',
            children: null,
          },
          {
            label: '龟山区',
            value: '711421',
            children: null,
          },
          {
            label: '八德区',
            value: '711422',
            children: null,
          },
          {
            label: '大溪区',
            value: '711423',
            children: null,
          },
          {
            label: '复兴区',
            value: '711424',
            children: null,
          },
          {
            label: '大园区',
            value: '711425',
            children: null,
          },
          {
            label: '芦竹区',
            value: '711426',
            children: null,
          },
        ],
      },
      {
        label: '苗栗县',
        value: '711500',
        children: [
          {
            label: '竹南镇',
            value: '711519',
            children: null,
          },
          {
            label: '头份市',
            value: '711520',
            children: null,
          },
          {
            label: '三湾乡',
            value: '711521',
            children: null,
          },
          {
            label: '南庄乡',
            value: '711522',
            children: null,
          },
          {
            label: '狮潭乡',
            value: '711523',
            children: null,
          },
          {
            label: '后龙镇',
            value: '711524',
            children: null,
          },
          {
            label: '通霄镇',
            value: '711525',
            children: null,
          },
          {
            label: '苑里镇',
            value: '711526',
            children: null,
          },
          {
            label: '苗栗市',
            value: '711527',
            children: null,
          },
          {
            label: '造桥乡',
            value: '711528',
            children: null,
          },
          {
            label: '头屋乡',
            value: '711529',
            children: null,
          },
          {
            label: '公馆乡',
            value: '711530',
            children: null,
          },
          {
            label: '大湖乡',
            value: '711531',
            children: null,
          },
          {
            label: '泰安乡',
            value: '711532',
            children: null,
          },
          {
            label: '铜锣乡',
            value: '711533',
            children: null,
          },
          {
            label: '三义乡',
            value: '711534',
            children: null,
          },
          {
            label: '西湖乡',
            value: '711535',
            children: null,
          },
          {
            label: '卓兰镇',
            value: '711536',
            children: null,
          },
        ],
      },
      {
        label: '彰化县',
        value: '711700',
        children: [
          {
            label: '彰化市',
            value: '711727',
            children: null,
          },
          {
            label: '芬园乡',
            value: '711728',
            children: null,
          },
          {
            label: '花坛乡',
            value: '711729',
            children: null,
          },
          {
            label: '秀水乡',
            value: '711730',
            children: null,
          },
          {
            label: '鹿港镇',
            value: '711731',
            children: null,
          },
          {
            label: '福兴乡',
            value: '711732',
            children: null,
          },
          {
            label: '线西乡',
            value: '711733',
            children: null,
          },
          {
            label: '和美镇',
            value: '711734',
            children: null,
          },
          {
            label: '伸港乡',
            value: '711735',
            children: null,
          },
          {
            label: '员林市',
            value: '711736',
            children: null,
          },
          {
            label: '社头乡',
            value: '711737',
            children: null,
          },
          {
            label: '永靖乡',
            value: '711738',
            children: null,
          },
          {
            label: '埔心乡',
            value: '711739',
            children: null,
          },
          {
            label: '溪湖镇',
            value: '711740',
            children: null,
          },
          {
            label: '大村乡',
            value: '711741',
            children: null,
          },
          {
            label: '埔盐乡',
            value: '711742',
            children: null,
          },
          {
            label: '田中镇',
            value: '711743',
            children: null,
          },
          {
            label: '北斗镇',
            value: '711744',
            children: null,
          },
          {
            label: '田尾乡',
            value: '711745',
            children: null,
          },
          {
            label: '埤头乡',
            value: '711746',
            children: null,
          },
          {
            label: '溪州乡',
            value: '711747',
            children: null,
          },
          {
            label: '竹塘乡',
            value: '711748',
            children: null,
          },
          {
            label: '二林镇',
            value: '711749',
            children: null,
          },
          {
            label: '大城乡',
            value: '711750',
            children: null,
          },
          {
            label: '芳苑乡',
            value: '711751',
            children: null,
          },
          {
            label: '二水乡',
            value: '711752',
            children: null,
          },
        ],
      },
      {
        label: '嘉义县',
        value: '711900',
        children: [
          {
            label: '番路乡',
            value: '711919',
            children: null,
          },
          {
            label: '梅山乡',
            value: '711920',
            children: null,
          },
          {
            label: '竹崎乡',
            value: '711921',
            children: null,
          },
          {
            label: '阿里山乡',
            value: '711922',
            children: null,
          },
          {
            label: '中埔乡',
            value: '711923',
            children: null,
          },
          {
            label: '大埔乡',
            value: '711924',
            children: null,
          },
          {
            label: '水上乡',
            value: '711925',
            children: null,
          },
          {
            label: '鹿草乡',
            value: '711926',
            children: null,
          },
          {
            label: '太保市',
            value: '711927',
            children: null,
          },
          {
            label: '朴子市',
            value: '711928',
            children: null,
          },
          {
            label: '东石乡',
            value: '711929',
            children: null,
          },
          {
            label: '六脚乡',
            value: '711930',
            children: null,
          },
          {
            label: '新港乡',
            value: '711931',
            children: null,
          },
          {
            label: '民雄乡',
            value: '711932',
            children: null,
          },
          {
            label: '大林镇',
            value: '711933',
            children: null,
          },
          {
            label: '溪口乡',
            value: '711934',
            children: null,
          },
          {
            label: '义竹乡',
            value: '711935',
            children: null,
          },
          {
            label: '布袋镇',
            value: '711936',
            children: null,
          },
        ],
      },
      {
        label: '云林县',
        value: '712100',
        children: [
          {
            label: '斗南镇',
            value: '712121',
            children: null,
          },
          {
            label: '大埤乡',
            value: '712122',
            children: null,
          },
          {
            label: '虎尾镇',
            value: '712123',
            children: null,
          },
          {
            label: '土库镇',
            value: '712124',
            children: null,
          },
          {
            label: '褒忠乡',
            value: '712125',
            children: null,
          },
          {
            label: '东势乡',
            value: '712126',
            children: null,
          },
          {
            label: '台西乡',
            value: '712127',
            children: null,
          },
          {
            label: '仑背乡',
            value: '712128',
            children: null,
          },
          {
            label: '麦寮乡',
            value: '712129',
            children: null,
          },
          {
            label: '斗六市',
            value: '712130',
            children: null,
          },
          {
            label: '林内乡',
            value: '712131',
            children: null,
          },
          {
            label: '古坑乡',
            value: '712132',
            children: null,
          },
          {
            label: '莿桐乡',
            value: '712133',
            children: null,
          },
          {
            label: '西螺镇',
            value: '712134',
            children: null,
          },
          {
            label: '二仑乡',
            value: '712135',
            children: null,
          },
          {
            label: '北港镇',
            value: '712136',
            children: null,
          },
          {
            label: '水林乡',
            value: '712137',
            children: null,
          },
          {
            label: '口湖乡',
            value: '712138',
            children: null,
          },
          {
            label: '四湖乡',
            value: '712139',
            children: null,
          },
          {
            label: '元长乡',
            value: '712140',
            children: null,
          },
        ],
      },
      {
        label: '屏东县',
        value: '712400',
        children: [
          {
            label: '屏东市',
            value: '712434',
            children: null,
          },
          {
            label: '三地门乡',
            value: '712435',
            children: null,
          },
          {
            label: '雾台乡',
            value: '712436',
            children: null,
          },
          {
            label: '玛家乡',
            value: '712437',
            children: null,
          },
          {
            label: '九如乡',
            value: '712438',
            children: null,
          },
          {
            label: '里港乡',
            value: '712439',
            children: null,
          },
          {
            label: '高树乡',
            value: '712440',
            children: null,
          },
          {
            label: '盐埔乡',
            value: '712441',
            children: null,
          },
          {
            label: '长治乡',
            value: '712442',
            children: null,
          },
          {
            label: '麟洛乡',
            value: '712443',
            children: null,
          },
          {
            label: '竹田乡',
            value: '712444',
            children: null,
          },
          {
            label: '内埔乡',
            value: '712445',
            children: null,
          },
          {
            label: '万丹乡',
            value: '712446',
            children: null,
          },
          {
            label: '潮州镇',
            value: '712447',
            children: null,
          },
          {
            label: '泰武乡',
            value: '712448',
            children: null,
          },
          {
            label: '来义乡',
            value: '712449',
            children: null,
          },
          {
            label: '万峦乡',
            value: '712450',
            children: null,
          },
          {
            label: '崁顶乡',
            value: '712451',
            children: null,
          },
          {
            label: '新埤乡',
            value: '712452',
            children: null,
          },
          {
            label: '南州乡',
            value: '712453',
            children: null,
          },
          {
            label: '林边乡',
            value: '712454',
            children: null,
          },
          {
            label: '东港镇',
            value: '712455',
            children: null,
          },
          {
            label: '琉球乡',
            value: '712456',
            children: null,
          },
          {
            label: '佳冬乡',
            value: '712457',
            children: null,
          },
          {
            label: '新园乡',
            value: '712458',
            children: null,
          },
          {
            label: '枋寮乡',
            value: '712459',
            children: null,
          },
          {
            label: '枋山乡',
            value: '712460',
            children: null,
          },
          {
            label: '春日乡',
            value: '712461',
            children: null,
          },
          {
            label: '狮子乡',
            value: '712462',
            children: null,
          },
          {
            label: '车城乡',
            value: '712463',
            children: null,
          },
          {
            label: '牡丹乡',
            value: '712464',
            children: null,
          },
          {
            label: '恒春镇',
            value: '712465',
            children: null,
          },
          {
            label: '满州乡',
            value: '712466',
            children: null,
          },
        ],
      },
      {
        label: '台东县',
        value: '712500',
        children: [
          {
            label: '台东市',
            value: '712517',
            children: null,
          },
          {
            label: '绿岛乡',
            value: '712518',
            children: null,
          },
          {
            label: '兰屿乡',
            value: '712519',
            children: null,
          },
          {
            label: '延平乡',
            value: '712520',
            children: null,
          },
          {
            label: '卑南乡',
            value: '712521',
            children: null,
          },
          {
            label: '鹿野乡',
            value: '712522',
            children: null,
          },
          {
            label: '关山镇',
            value: '712523',
            children: null,
          },
          {
            label: '海端乡',
            value: '712524',
            children: null,
          },
          {
            label: '池上乡',
            value: '712525',
            children: null,
          },
          {
            label: '东河乡',
            value: '712526',
            children: null,
          },
          {
            label: '成功镇',
            value: '712527',
            children: null,
          },
          {
            label: '长滨乡',
            value: '712528',
            children: null,
          },
          {
            label: '金峰乡',
            value: '712529',
            children: null,
          },
          {
            label: '大武乡',
            value: '712530',
            children: null,
          },
          {
            label: '达仁乡',
            value: '712531',
            children: null,
          },
          {
            label: '太麻里乡',
            value: '712532',
            children: null,
          },
        ],
      },
      {
        label: '花莲县',
        value: '712600',
        children: [
          {
            label: '花莲市',
            value: '712615',
            children: null,
          },
          {
            label: '新城乡',
            value: '712616',
            children: null,
          },
          {
            label: '秀林乡',
            value: '712618',
            children: null,
          },
          {
            label: '吉安乡',
            value: '712619',
            children: null,
          },
          {
            label: '寿丰乡',
            value: '712620',
            children: null,
          },
          {
            label: '凤林镇',
            value: '712621',
            children: null,
          },
          {
            label: '光复乡',
            value: '712622',
            children: null,
          },
          {
            label: '丰滨乡',
            value: '712623',
            children: null,
          },
          {
            label: '瑞穗乡',
            value: '712624',
            children: null,
          },
          {
            label: '万荣乡',
            value: '712625',
            children: null,
          },
          {
            label: '玉里镇',
            value: '712626',
            children: null,
          },
          {
            label: '卓溪乡',
            value: '712627',
            children: null,
          },
          {
            label: '富里乡',
            value: '712628',
            children: null,
          },
        ],
      },
      {
        label: '澎湖县',
        value: '712700',
        children: [
          {
            label: '马公市',
            value: '712707',
            children: null,
          },
          {
            label: '西屿乡',
            value: '712708',
            children: null,
          },
          {
            label: '望安乡',
            value: '712709',
            children: null,
          },
          {
            label: '七美乡',
            value: '712710',
            children: null,
          },
          {
            label: '白沙乡',
            value: '712711',
            children: null,
          },
          {
            label: '湖西乡',
            value: '712712',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '香港特别行政区',
    value: '810000',
    children: [
      {
        label: '香港特别行政区',
        value: '810100',
        children: [
          {
            label: '中西区',
            value: '810101',
            children: null,
          },
          {
            label: '东区',
            value: '810102',
            children: null,
          },
          {
            label: '九龙城区',
            value: '810103',
            children: null,
          },
          {
            label: '观塘区',
            value: '810104',
            children: null,
          },
          {
            label: '南区',
            value: '810105',
            children: null,
          },
          {
            label: '深水埗区',
            value: '810106',
            children: null,
          },
          {
            label: '湾仔区',
            value: '810107',
            children: null,
          },
          {
            label: '黄大仙区',
            value: '810108',
            children: null,
          },
          {
            label: '油尖旺区',
            value: '810109',
            children: null,
          },
          {
            label: '离岛区',
            value: '810110',
            children: null,
          },
          {
            label: '葵青区',
            value: '810111',
            children: null,
          },
          {
            label: '北区',
            value: '810112',
            children: null,
          },
          {
            label: '西贡区',
            value: '810113',
            children: null,
          },
          {
            label: '沙田区',
            value: '810114',
            children: null,
          },
          {
            label: '屯门区',
            value: '810115',
            children: null,
          },
          {
            label: '大埔区',
            value: '810116',
            children: null,
          },
          {
            label: '荃湾区',
            value: '810117',
            children: null,
          },
          {
            label: '元朗区',
            value: '810118',
            children: null,
          },
        ],
      },
    ],
  },
  {
    label: '澳门特别行政区',
    value: '820000',
    children: [
      {
        label: '澳门特别行政区',
        value: '820100',
        children: [
          {
            label: '澳门半岛',
            value: '820101',
            children: null,
          },
          {
            label: '凼仔',
            value: '820102',
            children: null,
          },
          {
            label: '路凼城',
            value: '820103',
            children: null,
          },
          {
            label: '路环',
            value: '820104',
            children: null,
          },
        ],
      },
    ],
  },
];
