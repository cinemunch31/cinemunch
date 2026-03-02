import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const postsDir = path.resolve('./posts');
const outFile = path.resolve('./posts.json');

function run(){
  if(!fs.existsSync(postsDir)){
    console.error('Posts directory not found, create posts/*.md files');
    process.exit(1);
  }
  const files = fs.readdirSync(postsDir).filter(f=>f.endsWith('.md'));
  const posts = files.map(file=>{
    const full = path.join(postsDir,file);
    const text = fs.readFileSync(full,'utf8');
    const {data, content} = matter(text);
    return {
      id: data.id || path.basename(file, '.md'),
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category || 'misc',
      excerpt: data.excerpt || '',
      content: marked(content),
    };
  });
  fs.writeFileSync(outFile, JSON.stringify(posts, null, 2));
  console.log(`Generated ${posts.length} posts to ${outFile}`);
}

run();
