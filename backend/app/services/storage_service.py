"""Storage abstraction. Local filesystem implementation for v1.

Swap this module's implementation for S3/NAS later without touching callers —
callers only depend on the four functions below.
"""
import os
import shutil

from app.core.config import get_settings

settings = get_settings()


def _ensure_dirs() -> None:
    os.makedirs(settings.storage_path, exist_ok=True)
    os.makedirs(os.path.join(settings.storage_path, "_chunks"), exist_ok=True)


def chunk_dir(upload_id: str) -> str:
    _ensure_dirs()
    path = os.path.join(settings.storage_path, "_chunks", upload_id)
    os.makedirs(path, exist_ok=True)
    return path


def write_chunk(upload_id: str, index: int, data: bytes) -> None:
    path = os.path.join(chunk_dir(upload_id), f"{index:08d}.part")
    with open(path, "wb") as f:
        f.write(data)


def chunk_exists(upload_id: str, index: int) -> bool:
    path = os.path.join(chunk_dir(upload_id), f"{index:08d}.part")
    return os.path.exists(path)


def assemble_chunks(upload_id: str, total_chunks: int, stored_filename: str) -> str:
    """Concatenates all chunks into the final storage file, returns full path."""
    _ensure_dirs()
    final_path = os.path.join(settings.storage_path, stored_filename)
    src_dir = chunk_dir(upload_id)
    with open(final_path, "wb") as out:
        for i in range(total_chunks):
            part_path = os.path.join(src_dir, f"{i:08d}.part")
            with open(part_path, "rb") as part:
                shutil.copyfileobj(part, out)
    shutil.rmtree(src_dir, ignore_errors=True)
    return final_path


def abort_upload(upload_id: str) -> None:
    shutil.rmtree(chunk_dir(upload_id), ignore_errors=True)


def file_path(stored_filename: str) -> str:
    return os.path.join(settings.storage_path, stored_filename)


def file_exists(stored_filename: str) -> bool:
    return os.path.exists(file_path(stored_filename))


def delete_file(stored_filename: str) -> None:
    path = file_path(stored_filename)
    if os.path.exists(path):
        os.remove(path)
