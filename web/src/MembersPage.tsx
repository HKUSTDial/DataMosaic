import nanTangPortrait from '../../assets/members/nan-tang.jpg';
import haixunWangPortrait from '../../assets/members/haixun-wang.jpg';
import zhuowenLiangPortrait from '../../assets/members/zhuowen-liang.jpeg';
import zhengxuanZhangPortrait from '../../assets/members/zhengxuan-zhang.jpg';
import chenyuYangPortrait from '../../assets/members/chenyu-yang.png';
import yuxiangLuoPortrait from '../../assets/members/yuxiang-luo.png';
import zechaoChenPortrait from '../../assets/members/zechao-chen.png';
import ruilangWangPortrait from '../../assets/members/ruilang-wang.jpg';
import yingxiaYePortrait from '../../assets/members/yingxia-ye.png';
import { siteUrl } from './site';

const leaders = [
  {
    name: 'Nan Tang',
    portrait: nanTangPortrait,
    homepage: 'https://nantang.github.io/',
    description: 'Associate Professor\nAssociate Dean, Information Hub\n@ HKUST(GZ)\nACM Distinguished Member',
    scholar: 'https://scholar.google.com/citations?user=poXWlycAAAAJ',
    linkedin: 'https://www.linkedin.com/in/nan-tang-0695135',
  },
  {
    name: 'Haixun Wang',
    portrait: haixunWangPortrait,
    homepage: 'https://haixun.github.io/',
    description: 'VP Engineering, Head of AI\n@ EvenUp\nAffiliate Full Professor\n@ University of Washington\nACM Fellow, IEEE Fellow',
    scholar: 'https://scholar.google.com/citations?user=Q1mcglAAAAAJ&hl=en',
    linkedin: 'https://www.linkedin.com/in/haixun/',
  },
];
const students = [
  { name: 'Zhuowen Liang', portrait: zhuowenLiangPortrait, homepage: 'https://setonliang.github.io/', scholar: 'https://scholar.google.com/citations?hl=zh-CN&user=cjXF-ZIAAAAJ' },
  { name: 'Zhengxuan Zhang', portrait: zhengxuanZhangPortrait, homepage: 'https://scholar.google.com/citations?user=ABHvH94AAAAJ', scholar: 'https://scholar.google.com/citations?user=ABHvH94AAAAJ' },
  { name: 'Zechao Chen', portrait: zechaoChenPortrait, homepage: 'https://blog.ackth.cc/about', scholar: 'https://scholar.google.com/citations?hl=zh-CN&user=6d4h1zMAAAAJ' },
  { name: 'Chenyu Yang', portrait: chenyuYangPortrait, homepage: 'https://scholar.google.com/citations?hl=zh-CN&user=4NOsk-gAAAAJ', scholar: 'https://scholar.google.com/citations?hl=zh-CN&user=4NOsk-gAAAAJ' },
  { name: 'Yuxiang Luo', portrait: yuxiangLuoPortrait, homepage: 'https://scholar.google.com/citations?hl=zh-CN&user=SwBmffAAAAAJ', scholar: 'https://scholar.google.com/citations?hl=zh-CN&user=SwBmffAAAAAJ' },
  { name: 'Ruilang Wang', portrait: ruilangWangPortrait, description: 'MPhil Student @HKUST(GZ)' },
  { name: 'Yingxia Ye', portrait: yingxiaYePortrait, description: 'MPhil Student @HKUST(GZ)' },
];

export default function MembersPage() {
  return <>
    <a className="research-back" href={siteUrl('/')}>← Back to DataMosaic</a>
    <section className="members-section" aria-labelledby="leaders-title">
      <h2 id="leaders-title">Leaders</h2>
      <div className="members-grid">
        {leaders.map(member => <article className="member-card" key={member.name} aria-label={member.name}>
          <img className="member-photo" src={member.portrait} alt={member.name} width="280" height="350" decoding="async"/>
          <div className="member-info">
            <h3><a href={member.homepage} target="_blank" rel="noreferrer">{member.name}</a></h3>
            <p style={{ whiteSpace: 'pre-line' }}>{member.description}</p>
            <div className="member-links">
              <a href={member.scholar} target="_blank" rel="noreferrer" aria-label={`${member.name} on Google Scholar`}>Google Scholar</a>
              <span aria-hidden="true">|</span>
              <a href={member.linkedin} target="_blank" rel="noreferrer" aria-label={`${member.name} on LinkedIn`}>LinkedIn</a>
            </div>
          </div>
        </article>)}
      </div>
    </section>
    <section className="members-section" aria-labelledby="students-title">
      <h2 id="students-title">Students</h2>
      <div className="members-grid">
        {students.map(student => <article className="member-card" key={student.name} aria-label={student.name}>
          <img className="member-photo" src={student.portrait} alt={student.name} width="280" height="350" loading="lazy" decoding="async"/>
          <div className="member-info">
            <h3>{student.homepage ? <a href={student.homepage} target="_blank" rel="noreferrer">{student.name}</a> : student.name}</h3>
            <p>{student.description ?? 'Ph.D. Student @HKUST(GZ)'}</p>
            {student.scholar && <div className="member-links">
              <a href={student.scholar} target="_blank" rel="noreferrer" aria-label={`${student.name} on Google Scholar`}>Google Scholar</a>
            </div>}
          </div>
        </article>)}
      </div>
    </section>
  </>;
}
